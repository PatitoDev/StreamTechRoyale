import WebSocket from 'ws';
import expressws from 'express-ws';
import express from 'express';
import creatorRepository from './repository/creatorRepository';
import cors from 'cors';
import { ChannelsLiveEvent, ClipChangeEvent, Creator, CreatorDto } from '@streamtechroyale/models';
import TwitchApi from './twitchApi';
import { clipRepository } from './repository/clipRepository';
import { userClipLikedRepository } from './repository/userClipLikedRepository';

const PORT = 8090;

const app = expressws(express()).app;
let connections: Array<WebSocket> = [];

const onLiveChannelChange = async (channels: Array<Creator>) => {
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
    for (const connection of connections) {
        connection.send(JSON.stringify(channelsLiveEvent));
    }
};

const twitchApi = new TwitchApi(onLiveChannelChange);

app.ws('/', async (socket) => {
    connections.push(socket);
    console.log('someone connected');

    socket.on('close', () => {
        connections = connections.filter((item) => item !== socket);
    });

    const channels = await twitchApi.getLiveChannels();

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
            profileImgUrl: creator.profileImgUrl,
            tiktok: creator.tiktok,
            youtube: creator.youtube
        } satisfies CreatorDto));

        res.send(JSON.stringify(creatorsDto));

    } catch {
        res.sendStatus(500);
    }
});

app.get('/clips', async (_, res) => {
    const clips = await clipRepository.getClips();
    res.send(JSON.stringify(clips));
});

app.get('/user/me/likedClips', async (req, res) => {
    const result = await userClipLikedRepository.get('TEST_USER');
    res.send(JSON.stringify(result));
});

// TODO - get user from token
app.post('/user/me/clip/:clipId/like', async (req, res) => {
    const { clipId } = req.params;
    const result = await clipRepository.increaseLikeByOne(clipId);
    res.send(JSON.stringify(result));
    for (const connection of connections) {
        connection.send(JSON.stringify({
            type: 'clip-change',
            content: result
        } satisfies ClipChangeEvent));
    }
    userClipLikedRepository.create(clipId, 'TEST_USER');
});

// TODO - get user from token
app.delete('/user/me/clip/:clipId/like', async (req, res) => {
    const { clipId } = req.params;
    const result = await clipRepository.decreaseLikeByOne(clipId);
    res.send(JSON.stringify(result));
    for (const connection of connections) {
        connection.send(JSON.stringify({
            type: 'clip-change',
            content: result
        } satisfies ClipChangeEvent));
    }
    userClipLikedRepository.destroy(clipId, 'TEST_USER');
});

app.listen(PORT, () => {
    console.log(`Started server at port:${PORT}`);
});