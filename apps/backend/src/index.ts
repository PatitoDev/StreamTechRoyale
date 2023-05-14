import expressws from 'express-ws';
import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { ChannelsLiveEvent, Clip, Creator } from '@streamtechroyale/models';
import TwitchApi from './twitchApi';
import { ApiException } from '@streamtechroyale/models/responses/apiExceptions';
import { Mapper } from './mapper';
import { wsServer } from './ws';

const PORT = 8090;
const CLIP_INTERVAL = 60 * 5;

const app = expressws(express()).app;
app.use(cors());
app.use(express.json());

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
import { TeamController } from './controllers/teamController';
import { UserController } from './controllers/userController';
import { RouletteController } from './controllers/roulletteController';
import { TournamentController } from './controllers/tournamentController';
import creatorRepository from './repository/creatorRepository';
import { clipRepository } from './repository/clipRepository';
import { wrap } from './exceptions/wrap';

app.use('/auth', AuthController);
app.use('/clip', ClipController);
app.use('/creator', CreatorController);
app.use('/tournament', TournamentController);
app.use('/team', TeamController);
app.use('/user', UserController);
app.use('/roullette', RouletteController);

app.get('/creators', wrap(async (req, res) => {
    const creators = await creatorRepository.getCreators();
    const creatorsDto = creators.map(Mapper.toCreatorDto);
    res.send(JSON.stringify(creatorsDto));
}));

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

// clip fetcher
const fetchClipsFromChannel = async (creator: Creator, fromDate: string) => {
    const twitchId = creator.twitch?.toLowerCase();
    if (!twitchId) return;

    const channelClips = await twitchApi.getClipsFromChannel(twitchId, fromDate) ?? [];
    const mappedClips = channelClips.map((clip) => ({
        creatorId: creator.id,
        clippedById: clip.creatorId,
        clippedByName: clip.creatorDisplayName,
        id: clip.id,
        name: clip.title,
        likes: 0,
        thumbnailUrl: clip.thumbnailUrl
    } satisfies Clip));

    for (const clip of mappedClips) {
        const exits = await clipRepository.get(clip.id);
        if (exits) return;
        console.log(`Adding clip for ${creator.name}`);
        await clipRepository.putClip(clip);
    }
};

let offsetDate = new Date().toISOString();

const fetchClips = async () => {
    // set interval
    const fromDate = offsetDate;
    offsetDate = new Date().toISOString();
    const creators = await creatorRepository.getCreators();
    for (const creator of creators) {
        await fetchClipsFromChannel(creator, fromDate);
    }
};

/*
setInterval(() => {
    fetchClips();
}, CLIP_INTERVAL * 1000);
*/

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Started server at port:${PORT}`);
});