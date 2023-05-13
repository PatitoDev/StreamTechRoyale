import express from 'express';
import { Authentication } from '../authentication';
import { userClipLikedRepository } from '../repository/userClipLikedRepository';
import { clipRepository } from '../repository/clipRepository';
import { userRepresentationRepository } from '../repository/userRepresentationRepository';
import creatorRepository from '../repository/creatorRepository';
import { wrap } from '../exceptions/wrap';
import { BadRequestException, NotFoundException } from '@streamtechroyale/models/responses/apiExceptions';
import { state } from './tournamentController';
const app = express.Router();

app.get('/me/likedClips', wrap(async (req, res) => {
    const { id: userId } = await Authentication.validate(req);
    const result = await userClipLikedRepository.get(userId);
    res.send(JSON.stringify(result));
}));

app.post('/me/clip/:clipId/like', wrap(async (req, res) => {
    const { id: userId } = await Authentication.validate(req);
    const { clipId } = req.params;
    if (!clipId) throw new BadRequestException();
    const allClips = await userClipLikedRepository.get(userId);
    const exists  = allClips.find(item => item.clipId === clipId);

    if (exists) {
        res.sendStatus(400);
        return;
    }

    const result = await clipRepository.increaseLikeByOne(clipId);
    res.send(JSON.stringify(result));
    /*
    const clipEvent:ClipChangeEvent = {
        type: 'clip-change',
        content: result
    };
    wsServer.broadcast(clipEvent);
    */
    userClipLikedRepository.create(clipId, userId);
}));

app.delete('/me/clip/:clipId/like', wrap(async (req, res) => {
    const { id: userId } = await Authentication.validate(req);
    const { clipId } = req.params;
    if (!clipId) throw new BadRequestException();

    const allClips = await userClipLikedRepository.get(userId);
    const exists  = allClips.find(item => item.clipId === clipId);
    if (!exists) {
        res.sendStatus(400);
        return;
    }

    const result = await clipRepository.decreaseLikeByOne(clipId);
    res.send(JSON.stringify(result));
    /*
    const clipEvent:ClipChangeEvent = {
        type: 'clip-change',
        content: result
    };
    wsServer.broadcast(clipEvent);
    */
    userClipLikedRepository.destroy(clipId, userId);

}));

app.get('/me/representation', wrap(async (req, res) => {
    const { id: userId } = await Authentication.validate(req);
    const representation = await userRepresentationRepository.getByUser(userId);
    res.send(representation);
}));

app.post('/me/representation/:creatorId', wrap(async (req, res) => {
    const { id: userId } = await Authentication.validate(req);
    const { creatorId } = req.params;
    if (!creatorId) throw new BadRequestException();
    const creator = await creatorRepository.getCreator(creatorId);
    if (!creator || !creator?.isActive) throw new NotFoundException('Creator not found or is not active');
    // TODO - fix state cycle
    if (!state.canPickRepresentation) throw new BadRequestException('Not allowing changes to representation at the moment');
    const userRepresentation = await userRepresentationRepository.getByUser(userId);
    if (userRepresentation) {
        await userRepresentationRepository.deleteItem(userRepresentation.userId, userRepresentation.creatorId);
    }
    await userRepresentationRepository.put(userId, creatorId);
    res.sendStatus(201);
}));

export const UserController = app;
