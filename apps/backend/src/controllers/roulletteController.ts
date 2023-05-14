import express from 'express';
import { Authentication } from '../authentication';
import { wrap } from '../exceptions/wrap';
import { prizeRepository } from '../repository/prizeRepository';
import { ProbabilityCategory, RoullettePrizeDto, RoullettePrizeWonEvent, RoulletteRestriction, RoulletteWin } from '@streamtechroyale/models';
import shortid from 'shortid';
import { wsServer } from '../ws';

const app = express.Router();

export const probability: Record<ProbabilityCategory, number> = {
    A: 5,
    B: 15,
    C: 30,
    D: 50,
};

const getDisplayPrizes = async () => {
    let prizes = await prizeRepository.getAll();
    prizes = prizes.filter((prize) => ( !prize.limited || prize.amount > 0));
    const displayPrizes:Array<RoullettePrizeDto> = [];
    for (const prize of prizes) {
        if (displayPrizes.find(item => item.type === prize.type)) continue;
        displayPrizes.push({
            type: prize.type,
            weightCategory: prize.category
        });
    }
    return displayPrizes;
};

app.get('/restriction', wrap(async (req, res) => {
    const { id } = await Authentication.validate(req);
    const restriction = await prizeRepository.getRestriction(id);
    res.send(restriction);
}));

app.get('/', wrap(async (req, res) => {
    // get all prizes that are still available
    const displayPrizes = await getDisplayPrizes();
    res.send(displayPrizes);
}));

const pickFromProbList = (categories: Array<{ category: ProbabilityCategory, prob: number}>) => {
    const randomNumber = Math.random();
    let summedProb = 0;
    const sorted = categories
        .sort((prev, next) => prev.prob - next.prob)
        .map(item => ({...item, prob: item.prob / 100}));
    console.log(sorted);
    for (const item of sorted) {
        summedProb += item.prob;
        if (randomNumber < summedProb) {
            console.log({
                summedProb,
                randomNumber,
                item
            });
            return item;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return sorted.at(-1)!;
};

const pickRandomPrize = async () => {
    // get prizes that are unlimited or still has stock
    const prizes = (await prizeRepository.getAll())
        .filter((prize) => !prize.limited || (prize.amount > 0));
    const availableCategories = new Map(prizes.map((item) => [item.category, item.category]));
    const prob = Array.from(availableCategories.keys())
        .map(item => ({ category: item, prob: probability[item] }));
    const pickedCategory = pickFromProbList(prob);
    const prizesToPickFrom = prizes.filter(item => item.category === pickedCategory.category);
    const newPrizeNumber = Math.floor(Math.random() * prizesToPickFrom.length);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pickedPrize = prizesToPickFrom[newPrizeNumber]!;
    return pickedPrize;
};

//const timeToNextRollInSeconds = 15;
const timeToNextRollInSeconds = 1800;

app.post('/play', wrap(async (req, res) => {
    const { id:userId, email, name, profilePicture } = await Authentication.validate(req);
    const restriction = await prizeRepository.getRestriction(userId);
    if (restriction) {
        const diff = (Date.now() - restriction.restrictValue) / 1000;
        console.log(diff);
        if (diff < timeToNextRollInSeconds) return res.sendStatus(400);
    }

    const pickedPrize = await pickRandomPrize();

    if (pickedPrize.limited) {
        await prizeRepository.put({
            ...pickedPrize,
            amount: pickedPrize.amount - 1
        });
    }

    const id =  shortid.generate();
    if (
        pickedPrize.type !== 'Gira otra vez!' &&
        pickedPrize.type !== 'Espera 30m'
    ){
        const winEntity:RoulletteWin = {
            id,
            prizeName: pickedPrize.name,
            userEmail: email,
            userName: name,
            userId,
            prize: pickedPrize
        };
        await prizeRepository.putPrizeWin(winEntity);
        wsServer.broadcast({
            type: 'roullette-prize-won',
            content: {
                prize: pickedPrize,
                user: {
                    id: userId,
                    name: name,
                    profilePicture: profilePicture
                }
            }
        } as RoullettePrizeWonEvent);
    }

    const timePlayed = Date.now();
    if (pickedPrize.type !== 'Gira otra vez!') {
        const newRestriction:RoulletteRestriction = {
            restrictValue: timePlayed,
            userId
        };
        await prizeRepository.putRestriction(newRestriction);
    }

    res.send({
        prize: pickedPrize,
        restriction: timePlayed
    });

    if (pickedPrize.limited) {
        setTimeout(async () => {
            wsServer.broadcast({
                type: 'roullette-stock-change',
                content: await getDisplayPrizes()
            });
        }, 15000);
    }
}));

export const RouletteController = app;