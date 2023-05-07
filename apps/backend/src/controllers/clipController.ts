import express from 'express';
import { clipRepository } from '../repository/clipRepository';
import { wrap } from '../exceptions/wrap';
const app = express.Router();

app.get('/', wrap(async (_, res) => {
    const clips = await clipRepository.getClips();
    res.send(JSON.stringify(clips));
}));

export const ClipController = app;
