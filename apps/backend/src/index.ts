import WebSocket from 'ws';
import expressws from 'express-ws';
import express, { Request, Response } from 'express';
import creatorRepository from './repository/creatorRepository';
import cors from 'cors';
import { ChannelsLiveEvent, ClipChangeEvent, Creator, CreatorDto } from '@streamtechroyale/models';
import TwitchApi from './twitchApi';
import { clipRepository } from './repository/clipRepository';
import { userClipLikedRepository } from './repository/userClipLikedRepository';
import { AuthenticationException } from './exceptions/authenticationException';
import { userRepresentationRepository } from './repository/userRepresentationRepository';
import * as jose from 'jose';
import SECRETS from '@streamtechroyale/secrets';
import { Config } from './config';
import { rounds } from './migrations/rounds';

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
            youtube: creator.youtube,
            teamId: creator.teamId
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
        const userId = await validateAuth(req);
        const result = await userClipLikedRepository.get(userId);
        res.send(JSON.stringify(result));
    } catch (err) {
        handleError(err, res);
    }
});

// TODO - User like validation
app.post('/user/me/clip/:clipId/like', async (req, res) => {
    try {
        const userId = await validateAuth(req);
        const { clipId } = req.params;
        const result = await clipRepository.increaseLikeByOne(clipId);
        res.send(JSON.stringify(result));
        for (const connection of connections) {
            connection.send(JSON.stringify({
                type: 'clip-change',
                content: result
            } satisfies ClipChangeEvent));
        }
        userClipLikedRepository.create(clipId, userId);
    } catch (err) {
        handleError(err, res);
    }
});

app.delete('/user/me/clip/:clipId/like', async (req, res) => {
    try {
        const userId = await validateAuth(req);
        const { clipId } = req.params;
        const result = await clipRepository.decreaseLikeByOne(clipId);
        res.send(JSON.stringify(result));
        for (const connection of connections) {
            connection.send(JSON.stringify({
                type: 'clip-change',
                content: result
            } satisfies ClipChangeEvent));
        }
        userClipLikedRepository.destroy(clipId, userId);
    } catch (err) {
        handleError(err, res);
    }
});

app.get('/user/me/representation', async (req, res) => {
    const userId = await validateAuth(req);
    const representation = await userRepresentationRepository.getByUser(userId);
    console.log(representation);
    res.send(representation);
});

app.post('/user/me/representation/:creatorId', async (req, res) => {
    const userId = await validateAuth(req);
    const { creatorId } = req.params;
    const creator = await creatorRepository.getCreator(creatorId);
    if (!creator) {
        res.sendStatus(404);
        return;
    }
    const userRepresentation = await userRepresentationRepository.getByUser(userId);
    if (userRepresentation) {
        res.statusCode = 400;
        res.send('Already representing a team');
        return;
    }
    await userRepresentationRepository.put(userId, creatorId);
    res.sendStatus(201);
});

app.post('/team/create', async (req, res) => {
    const userId = await validateAuth(req);
    if (!Config.adminId.includes(userId)) {
        res.sendStatus(403);
        return;
    }
    const creators = await creatorRepository.getCreators();
    creators.forEach((item, index) => {
        item.teamId = Math.floor(index / 3).toString();
    });
    for (const creator of creators) {
        await creatorRepository.updateCreator(creator);
    }
    res.send(creators);
});

app.get('/rounds', async (req, res) => {
    res.send(rounds);
});

app.get('/auth', async (req, res) => {
    try {
        const encryptionKey = new TextEncoder().encode(SECRETS.jwt.secret);
        const authorization = req.headers.authorization;
        if (!authorization) throw new Error();
        const twitchCode = authorization.replace('Bearer ', '');
        const userData = await twitchApi.validateToken(twitchCode);
        const jwt = await new jose.SignJWT({
            ...userData,
            aud: SECRETS.jwt.audience,
            iss: SECRETS.jwt.issuer
        })
            .setProtectedHeader({
                alg: 'HS256'
            })
            .setExpirationTime('5h')
            .sign(encryptionKey);

        res.send(JSON.stringify({ token: jwt, user: userData }));
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

const validateAuth = async (req: Request):Promise<string> => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) throw new Error();
        const token = authorization.replace('Bearer ', '');
        const encryptionKey = new TextEncoder().encode(SECRETS.jwt.secret);
        const jwtVerifyResult = await jose.jwtVerify(token, encryptionKey, {
            audience: SECRETS.jwt.audience,
            issuer: SECRETS.jwt.issuer,
        });
        const id = jwtVerifyResult.payload['id'];
        if (typeof id !== 'string') throw new Error();
        return id;
    } catch {
        throw new AuthenticationException();
    }
};

app.listen(PORT, () => {
    console.log(`Started server at port:${PORT}`);
});