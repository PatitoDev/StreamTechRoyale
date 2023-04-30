import WebSocket from 'ws';
import expressws from 'express-ws';
import express, { Request, Response } from 'express';
import creatorRepository from './repository/creatorRepository';
import cors from 'cors';
import { ChannelsLiveEvent, ClipChangeEvent, Creator, CreatorDto, UserDto } from '@streamtechroyale/models';
import TwitchApi from './twitchApi';
import { clipRepository } from './repository/clipRepository';
import { userClipLikedRepository } from './repository/userClipLikedRepository';
import {AuthenticationException} from './exceptions/authenticationException';

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
    try { 
        const userData = await getTokenDetails(req);
        const result = await userClipLikedRepository.get(userData.user_id);
        res.send(JSON.stringify(result));
    } catch (err) {
        handleError(err, res);
    }
});

// TODO - User like validation
app.post('/user/me/clip/:clipId/like', async (req, res) => {
    try {
        const userData = await getTokenDetails(req);
        const { clipId } = req.params;
        const result = await clipRepository.increaseLikeByOne(clipId);
        res.send(JSON.stringify(result));
        for (const connection of connections) {
            connection.send(JSON.stringify({
                type: 'clip-change',
                content: result
            } satisfies ClipChangeEvent));
        }
        userClipLikedRepository.create(clipId, userData.user_id);
    } catch (err) {
        handleError(err, res);
    }
});

app.delete('/user/me/clip/:clipId/like', async (req, res) => {
    try {
        const userData = await getTokenDetails(req);
        const { clipId } = req.params;
        const result = await clipRepository.decreaseLikeByOne(clipId);
        res.send(JSON.stringify(result));
        for (const connection of connections) {
            connection.send(JSON.stringify({
                type: 'clip-change',
                content: result
            } satisfies ClipChangeEvent));
        }
        userClipLikedRepository.destroy(clipId, userData.user_id);
    } catch (err) {
        handleError(err, res);
    }
});

app.get('/auth', async (req, res) => {
    try {
        const userData = await getTokenDetails(req);
        const responseData: UserDto = {
            id: userData.user_id,
            expires: userData.expires_in,
            name: userData.login,
        };
        res.send(JSON.stringify(responseData));
    } catch (err) {
        handleError(err, res);
    }
});

const handleError = (err: unknown, res: Response) => {
    if (err instanceof AuthenticationException) {
        res.sendStatus(401);
        return;
    }
    res.sendStatus(500);
};

const getTokenDetails = async (req: Request) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) throw new Error();
        const token = authorization.replace('Bearer ', '');
        const userData = await twitchApi.validateToken(token);
        return userData;
    } catch {
        throw new AuthenticationException();
    }
};

app.listen(PORT, () => {
    console.log(`Started server at port:${PORT}`);
});