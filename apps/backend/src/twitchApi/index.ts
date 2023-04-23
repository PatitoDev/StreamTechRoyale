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

    constructor(onLiveChannelCallback?: (creators: Array<Creator>) => void) {
        this._authProvider = new AppTokenAuthProvider(SECRETS.twitch.clientId, SECRETS.twitch.extensionSecret);
        this._client = new ApiClient({ authProvider: this._authProvider });
        this._liveChannels = [];
        this._onLiveChannelChange = onLiveChannelCallback;
        setInterval(this.updateLiveChannels, TIME_BETWEEN_UPDATES);
        this.updateLiveChannels();
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

    private updateLiveChannels = async () => {
        // TODO - cache this
        const creators = await creatorRepository.getCreators();
        const liveCreators = [];
        for (const creator of creators) {
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
        console.log(`Updated live channels. Live: ${liveCreators.length}`);
        this._liveChannels = liveCreators;

        if (this._onLiveChannelChange) {
            this._onLiveChannelChange(this._liveChannels);
        }
    };
}

export default TwitchAPI;