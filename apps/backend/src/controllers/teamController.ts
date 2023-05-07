import express from 'express';
import { Authentication } from '../authentication';
import creatorRepository from '../repository/creatorRepository';
import { randomizer } from '../randomizer';
import { Mapper } from '../mapper';
import { wrap } from '../exceptions/wrap';

const app = express.Router();
app.post('/create', wrap(async (req, res) => {
    await Authentication.validateAdmin(req);
    const creators = await creatorRepository.getCreators();
    const creatorsWithTeamId = randomizer.createTeams(creators);
    for (const creator of creatorsWithTeamId) {
        await creatorRepository.updateCreator(creator);
    }
    const mappedCreators = creatorsWithTeamId.map(Mapper.toCreatorDto);
    res.send(mappedCreators);
}));

export const TeamController = app;