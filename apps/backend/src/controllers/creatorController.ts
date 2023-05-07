import express from 'express';
import creatorRepository from '../repository/creatorRepository';
import { Mapper } from '../mapper';
import { wrap } from '../exceptions/wrap';

const app = express.Router();
app.get('/', wrap(async (_, res) => {
    try {
        const creators = await creatorRepository.getCreators();
        const creatorsDto = creators.map(Mapper.toCreatorDto);

        res.send(JSON.stringify(creatorsDto));

    } catch {
        res.sendStatus(500);
    }
}));

export const CreatorController = app;

