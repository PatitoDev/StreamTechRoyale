/* eslint-disable @typescript-eslint/no-non-null-assertion */
import express from 'express';
import { Authentication } from '../authentication';
import { roundPrize, rounds } from '../migrations/rounds';
import { wrap } from '../exceptions/wrap';
import { CreatorDto, CreatorsChangeEvent, EndRoundRequest, NotFoundException, RoundEndEvent, RoundEndEventPayload, RoundVictoryDto, StateChangeRequest, TournamentState, TournamentStateChangeEvent, UserRepresentation } from '@streamtechroyale/models';
import { wsServer } from '../ws';
import creatorRepository from '../repository/creatorRepository';
import { randomizer } from '../randomizer';
import { Mapper } from '../mapper';
import { tournamentWinRepository } from '../repository/tournamentWinRepository';
import { twitchApi } from '..';
import { userRepresentationRepository } from '../repository/userRepresentationRepository';
const app = express.Router();

export const state:Omit<TournamentState, 'victories'> = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    activeRound: rounds[0]!,
    canPickRepresentation: false,
};

app.get('/state', wrap(async (req, res) => {
    const victories = await tournamentWinRepository.getAll();
    const victoriesDto:Array<RoundVictoryDto> = victories.map((item) => ({
        creatorsWon: item.creatorsWon,
        round: item.round,
        prize: roundPrize.find(prize => prize.id === item.roundId),
        userWon: item.userWon
    }));

    res.send({
        ...state,
        victories: victoriesDto
    } as TournamentState);
}));

const updateTeams = async () => {
    if (state.activeRound.type === 'SOLO') {
        const creators = (await creatorRepository.getCreators());
        const updatedCreators = creators.map(c => ({...c, teamId: undefined }));
        for (const creator of updatedCreators) {
            await creatorRepository.updateCreator(creator);
        } 
        return;
    }

    let creators = (await creatorRepository.getCreators())
        .filter((creator) => creator.isActive);

    if (state.activeRound.teamSelection === 'random') {
        creators = randomizer.createTeams(creators);

    } else {
        creators = randomizer.createPreTeams(creators);
    } 

    for (const creator of creators) {
        await creatorRepository.updateCreator(creator);
    }

    const mappedCreators = creators.map(Mapper.toCreatorDto);

    wsServer.broadcast({
        type: 'creators-change',
        content: mappedCreators
    } satisfies CreatorsChangeEvent);
};

app.patch('/state', wrap(async (req, res) => {
    await Authentication.validateAdmin(req);

    let hasChanged = false;
    const { activeRoundId, canPickRepresentation } = req.body as StateChangeRequest;
    if (typeof activeRoundId === 'number') {
        const newRound = rounds.find(round => round.id === activeRoundId);
        if (newRound) {
            state.activeRound = newRound;
            hasChanged = true;
        }
    }

    if (typeof canPickRepresentation === 'boolean') {
        state.canPickRepresentation = canPickRepresentation;
        hasChanged = true;
    }


    if (!hasChanged) return;
    const victories = await tournamentWinRepository.getAll();
    const victoriesDto:Array<RoundVictoryDto> = victories.map((item) => ({
        creatorsWon: item.creatorsWon,
        round: item.round,
        prize: roundPrize.find((roundprize) => roundprize.id === item.roundId),
        userWon: item.userWon
    }));

    wsServer.broadcast({
        type: 'tournament-state-change',
        content: {
            activeRound: state.activeRound,
            canPickRepresentation: state.canPickRepresentation,
            victories: victoriesDto
        }
    } satisfies TournamentStateChangeEvent);

    await updateTeams();

    res.sendStatus(200);
}));

app.get('/round', wrap(async (req, res) => {
    await Authentication.validateAdmin(req);
    res.send(rounds);
}));

const pickRandomWinnerForCreator = async (creatorId: string) => {
    let items:Array<UserRepresentation> = [];
    if (state.activeRound.type === 'SOLO') {
        items = await userRepresentationRepository.getAllForCreator(creatorId);
    } else {
        // team
        const creatorWon = await creatorRepository.getCreator(creatorId);
        if (!creatorWon) throw new NotFoundException();
        const allCreators = await creatorRepository.getCreators();
        const teamMembers = allCreators.filter(c => c.teamId === creatorWon.teamId);
        for (const member of teamMembers) {
            const represent =  await userRepresentationRepository.getAllForCreator(member.id);
            items = items.concat(represent);
        }
    }
    if (items.length === 0) return;
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
};

app.post('/round/end', wrap(async (req, res) => {
    await Authentication.validateAdmin(req);
    const { creatorWonId } = (req.body as EndRoundRequest);
    const prize = roundPrize.find(prize => prize.id === state.activeRound.id);

    let creatorsWon:Array<CreatorDto> = [];

    const creatorWon = await creatorRepository.getCreator(creatorWonId);
    if (!creatorWon) throw new NotFoundException('creator not found');
    creatorsWon.push(Mapper.toCreatorDto(creatorWon));
    if (state.activeRound.type === 'TEAM') {
        // if its team get the rest of the memebers
        const teamMembers = (await creatorRepository.getCreators())
            .filter(item => item.teamId === creatorWon.teamId)
            .map(Mapper.toCreatorDto);
        creatorsWon = teamMembers;
    }

    let userWon:RoundEndEventPayload['userWon'] = undefined;

    const randomRepresentation = await pickRandomWinnerForCreator(creatorWonId);
    if (randomRepresentation) {
        const user = await twitchApi.getUserInfoById(randomRepresentation.userId);
        if (user) {
            userWon = {
                id: user.id,
                name: user.displayName,
                profileImage: user.profilePictureUrl
            };
        }
    }

    const responseData:RoundEndEventPayload = {
        creatorsWon,
        userWon,
        prize,
        round: state.activeRound
    };

    await tournamentWinRepository.put({
        roundId: state.activeRound.id,
        creatorsWon,
        round: state.activeRound,
        userWon
    });

    wsServer.broadcast({
        type: 'round-end',
        content: responseData
    } satisfies RoundEndEvent);

    const victories = await tournamentWinRepository.getAll();
    const victoriesDto:Array<RoundVictoryDto> = victories.map((item) => ({
        creatorsWon: item.creatorsWon,
        round: item.round,
        prize: roundPrize.find(p => p.id === item.roundId),
        userWon: item.userWon
    }));

    wsServer.broadcast({
        type: 'tournament-state-change',
        content: {
            activeRound: state.activeRound,
            canPickRepresentation: state.canPickRepresentation,
            victories: victoriesDto
        }
    } satisfies TournamentStateChangeEvent);

    res.sendStatus(200);
}));

export const TournamentController = app;