import { AuthenticationConfiguration } from '../authentication/config';
import SECRETS from '@streamtechroyale/secrets';
import { ApiClient, HelixPrivilegedUser } from '@twurple/api';
import { AppTokenAuthProvider, StaticAuthProvider } from '@twurple/auth';
import creatorRepository from '../repository/creatorRepository';
import { AuthenticationException, Creator, UserDto } from '@streamtechroyale/models';
import { rawDataSymbol } from '@twurple/common';

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

    public getUserInfoById = async (id: string) => {
        const resp = await this._client.users.getUserById(id);
        return resp;
    };

    public getUserInfo = async (name: string) => {
        const resp = await this._client.users.getUserByName(name);
        return resp;
    };

    public getLiveChannels = async () => {
        return this._liveChannels;
    };

    public getClipsFromChannel = async (channel: string, fromDate: string) => {
        const user = await this.getUserInfo(channel);
        if (!user) {
            console.log('user not found');
            return;
        }

        const resp = await this._client.clips.getClipsForBroadcaster(user.id, {
            startDate: fromDate,
        });
        // TODO - start pagination crawl
        return resp.data;
    };

    public validateToken = async (token: string):Promise<UserDto> => {
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

        // get email status
        const tAuth = new StaticAuthProvider(data.client_id, token);
        const tAPi = new ApiClient({ authProvider: tAuth });
        const tUser = await tAPi.users.getUserById(data.user_id);
        if (!tUser) throw new Error();
        //const email = (tUser as unknown as Record<string, unknown>)['email'];
        const email = ((tUser[rawDataSymbol]) as unknown as Record<string, unknown>)['email'];
        if (typeof email !== 'string') throw new AuthenticationException('Por favor usa una cuenta con el email verificado.');

        const twitchUser = await this._client.users.getUserById(data.user_id);
        return {
            id: data.user_id,
            name:  twitchUser?.displayName ?? data.login,
            profilePicture: twitchUser?.profilePictureUrl,
            isAdmin: AuthenticationConfiguration.adminId.includes(data.user_id),
            email: email,
        } satisfies UserDto;
    };

    private updateLiveChannels = async () => {
        const liveCreators:Array<Creator> = [];
        for (const creator of this._creators) {
            if (!creator.twitch) continue;
            const resp = await this.getChannelInfo(creator.twitch.toLowerCase());
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

        if (!isTheSame) {
            console.log(`Live channels changed: ${!isTheSame}`);
        }
        this._liveChannels = liveCreators;

        if (this._onLiveChannelChange && !isTheSame) {
            this._onLiveChannelChange(this._liveChannels);
        }
    };
}

export default TwitchAPI;