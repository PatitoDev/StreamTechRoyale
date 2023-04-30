import SECRETS from '@streamtechroyale/secrets';
import { ApiClient } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';
import creatorRepository from '../repository/creatorRepository';
import { Creator } from '@streamtechroyale/models';

const TIME_BETWEEN_UPDATES = 30000;


class TwitchAPI {
    private _authProvider: AppTokenAuthProvider;
    private _client: ApiClient;
    private _liveChannels: Array<Creator>;
    private _onLiveChannelChange?: ((creator: Array<Creator>) => void) | undefined;
    private _creators:Array<Creator> = [];

    constructor(onLiveChannelCallback?: (creators: Array<Creator>) => void) {
        this._authProvider = new AppTokenAuthProvider(SECRETS.twitch.clientId, SECRETS.twitch.extensionSecret);
        this._client = new ApiClient({ authProvider: this._authProvider });
        this._liveChannels = [];
        this._onLiveChannelChange = onLiveChannelCallback;
        setInterval(this.updateLiveChannels, TIME_BETWEEN_UPDATES);
        this.updateLiveChannels();

        creatorRepository
            .getCreators()
            .then((creators) => this._creators = creators);
    }

    public getChannelInfo = async (name: string) => {
        const resp = await this._client.search.searchChannels(name);
        const foundItem = resp.data.find(item => item.name === name);
        return foundItem;
    };

    public getUsersInfo = async (names: Array<string>) => {
        const resp = await this._client.users.getUsersByNames(names);
        return resp;
    };

    public getUserInfo = async (name: string) => {
        const resp = await this._client.users.getUserByName(name);
        return resp;
    };

    public getLiveChannels = async () => {
        return this._liveChannels;
    };

    public getClipsFromChannel = async (channel: string) => {
        const user = await this.getUserInfo(channel);
        if (!user) {
            console.log('user not found');
            return;
        }
        // TODO - set date filter
        const resp = await this._client.clips.getClipsForBroadcaster(user.id);
        // TODO - start pagination crawl
        return resp.data;
    };

    public validateToken = async (token: string) => {
        const headers = new Headers();
        headers.append('Authorization', `OAuth ${token}`);
        const resp = await fetch('https://id.twitch.tv/oauth2/validate', {
            headers
        });
        if (!resp.ok) throw new Error();
        const data = (await resp.json()) as {
            client_id: string,
            login: string,
            user_id: string,
            expires_in: number
        };

        if (data.client_id !== SECRETS.twitch.clientId) {
            throw new Error();
        }
        return data;
    };

    private updateLiveChannels = async () => {
        const liveCreators:Array<Creator> = [];
        for (const creator of this._creators) {
            if (!creator.twitch) continue;
            const resp = await this.getChannelInfo(creator.twitch);
            if (!resp) {
                console.log(`Could not find ${creator.twitch}`);
                continue;
            }
            if (resp.isLive) {
                liveCreators.push(creator);
            }
        }

        const isTheSame = (
            this._liveChannels.length === liveCreators.length &&
            this._liveChannels
                .every(channel => liveCreators.find((liveCreator) => liveCreator.id === channel.id))
        );

        console.log(`Live channels changed: ${!isTheSame}`);
        this._liveChannels = liveCreators;

        if (this._onLiveChannelChange && !isTheSame) {
            this._onLiveChannelChange(this._liveChannels);
        }
    };
}

export default TwitchAPI;