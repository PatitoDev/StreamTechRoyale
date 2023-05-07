import express from 'express';
import { Authentication } from '../authentication';
import { rounds } from '../migrations/rounds';
import creatorRepository from '../repository/creatorRepository';
import { randomizer } from '../randomizer';
import { Mapper } from '../mapper';
import { wsServer } from '../ws';
import { TournamentStateChangeEvent } from '@streamtechroyale/models';
import { wrap } from '../exceptions/wrap';
import { BadRequestException } from '@streamtechroyale/models/responses/apiExceptions';
const app = express.Router();

let activeRound = 1;

app.get('/', wrap(async (req, res) => {
    await Authentication.validate(req);
    res.send(rounds);
}));

app.get('/active', wrap(async (req, res) => {
    const round = rounds.find((item) => item.id === activeRound) ?? rounds[0];
    res.send(round);
}));

app.post('/active/:roundId', wrap(async (req, res) => {
    try {
        await Authentication.validate(req);
        const { roundId } = req.params;
        if (!roundId) throw new BadRequestException();
        activeRound = parseInt(roundId);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const currentRound = rounds.find(item => item.id === activeRound) || rounds[0]!;
        let creators = await creatorRepository.getCreators();

        if (currentRound.type === 'TEAM') {
            creators = randomizer.createTeams(creators);
            for (const creator of creators) {
                await creatorRepository.updateCreator(creator);
            }
        }

        console.log(activeRound);
        const mappedCreators = creators.map(Mapper.toCreatorDto);
        wsServer.broadcast({
            type: 'tournament-state-change',
            content: {
                activeRound: currentRound,
                creators: mappedCreators
            }
        } satisfies TournamentStateChangeEvent);
        res.sendStatus(200);
    } catch {
        res.sendStatus(403);
    }
}));

export const RoundController = app;