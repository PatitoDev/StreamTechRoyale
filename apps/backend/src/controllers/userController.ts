import express from 'express';
import { Authentication } from '../authentication';
import { userClipLikedRepository } from '../repository/userClipLikedRepository';
import { clipRepository } from '../repository/clipRepository';
import { ClipChangeEvent } from '@streamtechroyale/models';
import { userRepresentationRepository } from '../repository/userRepresentationRepository';
import creatorRepository from '../repository/creatorRepository';
import { wsServer } from '../ws';
import { wrap } from '../exceptions/wrap';
import { BadRequestException } from '@streamtechroyale/models/responses/apiExceptions';
const app = express.Router();

app.get('/me/likedClips', wrap(async (req, res) => {
    const userId = await Authentication.validate(req);
    const result = await userClipLikedRepository.get(userId);
    res.send(JSON.stringify(result));
}));

// TODO - User like validation
app.post('/me/clip/:clipId/like', wrap(async (req, res) => {
    const userId = await Authentication.validate(req);
    const { clipId } = req.params;
    if (!clipId) throw new BadRequestException();
    const result = await clipRepository.increaseLikeByOne(clipId);
    res.send(JSON.stringify(result));
    const clipEvent:ClipChangeEvent = {
        type: 'clip-change',
        content: result
    };
    wsServer.broadcast(clipEvent);
    userClipLikedRepository.create(clipId, userId);

}));

app.delete('/me/clip/:clipId/like', wrap(async (req, res) => {
    const userId = await Authentication.validate(req);
    const { clipId } = req.params;
    if (!clipId) throw new BadRequestException();
    const result = await clipRepository.decreaseLikeByOne(clipId);
    res.send(JSON.stringify(result));
    const clipEvent:ClipChangeEvent = {
        type: 'clip-change',
        content: result
    };
    wsServer.broadcast(clipEvent);
    userClipLikedRepository.destroy(clipId, userId);

}));

app.get('/me/representation', wrap(async (req, res) => {
    const userId = await Authentication.validate(req);
    const representation = await userRepresentationRepository.getByUser(userId);
    res.send(representation);
}));

app.post('/me/representation/:creatorId', wrap(async (req, res) => {
    const userId = await Authentication.validate(req);
    const { creatorId } = req.params;
    if (!creatorId) throw new BadRequestException();
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
}));

export const UserController = app;
