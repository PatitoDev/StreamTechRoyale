import { RoullettePrize, RoulletteRestriction, RoulletteWin } from '@streamtechroyale/models';
import dbClient from './dbClient';
import Tables from './dbClient/tables';

const get = async (id: string) => {
    const prizes = await dbClient.get({
        TableName: Tables.prize,
        Key: { id }
    });
    return (prizes.Item) as RoullettePrize | undefined;
};

const getAll = async () => {
    const prizes = await dbClient.scan({
        TableName: Tables.prize,
    });
    return (prizes.Items ?? []) as Array<RoullettePrize>;
};

const put = async (prize: RoullettePrize) => {
    dbClient.put({
        TableName: Tables.prize,
        Item: prize
    });
};

const putPrizeWin = async (item: RoulletteWin) => {
    await dbClient.put({
        TableName: Tables.roulletteWins,
        Item: item
    });
};

const putRestriction = async (item: RoulletteRestriction) => {
    await dbClient.put({
        TableName: Tables.roulletteRestriction,
        Item: item
    });
};

const getRestriction = async (userId: string) => {
    const { Item } = await dbClient.get({
        TableName: Tables.roulletteRestriction,
        Key: { userId }
    });
    return (Item as RoulletteRestriction | undefined);
};

export const prizeRepository = {
    getRestriction,
    putRestriction,
    putPrizeWin,
    getAll,
    get,
    put
};