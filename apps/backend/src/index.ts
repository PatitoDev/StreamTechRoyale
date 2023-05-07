import expressws from 'express-ws';
import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { ChannelsLiveEvent, Creator } from '@streamtechroyale/models';
import TwitchApi from './twitchApi';
import { ApiException } from '@streamtechroyale/models/responses/apiExceptions';
import { Mapper } from './mapper';
import { wsServer } from './ws';

const PORT = 8090;

const app = expressws(express()).app;
app.use(cors());

const onLiveChannelChange = async (channels: Array<Creator>) => {
    const channelsLiveEvent:ChannelsLiveEvent = {
        type: 'channels-live',
        content: channels.map(Mapper.toCreatorDto)
    };
    wsServer.broadcast(channelsLiveEvent);
};

export const twitchApi = new TwitchApi(onLiveChannelChange);
wsServer
    .addTwitchClient(twitchApi)
    .addWsClient(app);

app.use('/', (req, res, next) => {
    console.log(`[${req.method}] - ${req.path}`);
    next();
});

import { AuthController } from './controllers/authController'; 
import { ClipController } from './controllers/clipController';
import { CreatorController } from './controllers/creatorController';
import { RoundController } from './controllers/roundController';
import { TeamController } from './controllers/teamController';
import { UserController } from './controllers/userController';

app.use('/auth', AuthController);
app.use('/clip', ClipController);
app.use('/creator', CreatorController);
app.use('/round', RoundController);
app.use('/team', TeamController);
app.use('/user', UserController);

const errorHandler: ErrorRequestHandler = (err:unknown, req, res, next) => {
    if (err instanceof ApiException) {
        res.status(err.status);
        if (err.message) {
            res.send(err.message);
        }
        next();
        return;
    }
    console.log('Unhandled api exception (non wrapped)', err);
    res.sendStatus(500);
    next();
};

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Started server at port:${PORT}`);
});