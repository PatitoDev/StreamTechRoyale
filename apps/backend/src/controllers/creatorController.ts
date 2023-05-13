import express from 'express';
import creatorRepository from '../repository/creatorRepository';
import { Mapper } from '../mapper';
import { wrap } from '../exceptions/wrap';
import { Authentication } from '../authentication';
import { BadRequestException, Creator, CreatorChangeEvent, NotFoundException } from '@streamtechroyale/models';
import { wsServer } from '../ws';

const app = express.Router();

app.get('/', wrap(async (req, res) => {
    await Authentication.validateAdmin(req);
    const creators = await creatorRepository.getCreators();
    res.send(JSON.stringify(creators));
}));

app.get('/active', wrap(async (_, res) => {
    let creators = await creatorRepository.getCreators();
    creators = creators.filter((creator) => creator.isActive);
    const creatorsDto = creators.map(Mapper.toCreatorDto);

    res.send(JSON.stringify(creatorsDto));
}));

app.patch('/:creatorId', wrap(async (req, res) => {
    await Authentication.validateAdmin(req);
    const { creatorId } = req.params;
    if (!creatorId) throw new BadRequestException('missing creator id');
    const creator = await creatorRepository.getCreator(creatorId);
    if (!creator) throw new NotFoundException('creator not found');
    const { isActive, teamId } = req.body as Creator;
    if (typeof isActive !== 'boolean') throw new BadRequestException('isActive must be a boolean');
    if (teamId && typeof teamId !== 'string') throw new BadRequestException('teamId must be a string');
    const newCreator = {
        ...creator,
        isActive,
        teamId
    };

    await creatorRepository.updateCreator(newCreator);
    wsServer.broadcast({
        type: 'creator-change',
        content: Mapper.toCreatorDto(newCreator),
    } satisfies CreatorChangeEvent);

    res.sendStatus(200);
}));

export const CreatorController = app;
