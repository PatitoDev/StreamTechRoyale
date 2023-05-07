import WebSocket from 'ws';
import expressws from 'express-ws';
import TwitchAPI from '../twitchApi';
import { ChannelsLiveEvent, EventBase } from '@streamtechroyale/models';

class WebsocketServer {

    private _connections:Array<WebSocket> = [];
    private _app:expressws.Application | null = null;
    private _twitchClient:TwitchAPI | null = null;

    public broadcast = (event: EventBase) => {
        this._connections.forEach((conn) => conn.send(JSON.stringify(event)));
    };

    public addTwitchClient = (client: TwitchAPI) => {
        this._twitchClient = client;
        return this;
    };

    public addWsClient = (app: expressws.Application) => {
        this._app = app;
        this._connections = [];
        app.ws('/', async (socket) => {
            this._connections.push(socket);
            console.log('someone connected');

            socket.on('close', () => {
                this._connections = this._connections.filter((item) => item !== socket);
            });

            const channels = await this._twitchClient?.getLiveChannels() ?? [];

            const channelsLiveEvent:ChannelsLiveEvent = {
                type: 'channels-live',
                content: channels.map((item) => ({
                    group: item.group,
                    id: item.id,
                    name: item.name,
                    profileImgUrl: item.profileImgUrl,
                    instagram: item.instagram,
                    tiktok: item.tiktok,
                    twitch: item.twitch,
                    twitter: item.twitter,
                    youtube: item.youtube
                }))
            };
            socket.send(JSON.stringify(channelsLiveEvent));
        });
        return this;
    };
}

export const wsServer = new WebsocketServer();