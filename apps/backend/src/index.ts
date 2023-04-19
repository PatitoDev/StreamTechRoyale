import expressws from 'express-ws';
import express from 'express';
import creatorRepository from './repository/creatorRepository';
import cors from 'cors';
import { ChannelsLiveEvent, CreatorDto } from '@streamtechroyale/models';

const PORT = 8090;

const app = expressws(express()).app;

app.ws('/', async (socket) => {
    console.log('someone connected');

    const creators = await creatorRepository.getCreators();
    const channelsLiveEvent:ChannelsLiveEvent = {
        type: 'channels-live',
        content: creators.slice(5, 15),
    };
    socket.send(JSON.stringify(channelsLiveEvent));
});

app.use(cors());

app.use('/', (req, res, next) => {
    console.log(`[${req.method}] - ${req.path}`);
    next();
});

app.get('/creators', async (_, res) => {
    try {
        const creators = await creatorRepository.getCreators();

        const creatorsDto = creators.map((creator) => ({
            id: creator.id,
            group: creator.group,
            name: creator.name,
            instagram: creator.instagram,
            twitch: creator.twitch,
            twitter: creator.twitter,
            profileImgUrl: creator.profileImgUrl
        } satisfies CreatorDto));

        res.send(JSON.stringify(creatorsDto));

    } catch {
        res.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log(`Started server at port:${PORT}`);
});