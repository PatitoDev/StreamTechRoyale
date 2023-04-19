import SECRETS from '@streamtechroyale/secrets';
import { ApiClient} from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';

class TwitchAPI {
    private _authProvider: AppTokenAuthProvider;
    private _client: ApiClient;

    constructor() {
        this._authProvider = new AppTokenAuthProvider(SECRETS.twitch.clientId, SECRETS.twitch.extensionSecret);
        this._client = new ApiClient({ authProvider: this._authProvider });
    }

    public getChannelInfo = async (name: string) => {
        const resp = await this._client.search.searchChannels(name);
        return resp.data.at(0);
    };

    public getUsersInfo = async (names: Array<string>) => {
        const resp = await this._client.users.getUsersByNames(names);
        return resp;
    };

    public getUserInfo = async (name: string) => {
        const resp = await this._client.users.getUserByName(name);
        return resp;
    };
}

export default TwitchAPI;