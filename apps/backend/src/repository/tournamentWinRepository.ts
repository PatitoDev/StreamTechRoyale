import { RoundVictory } from '@streamtechroyale/models';
import dbClient from './dbClient';
import Tables from './dbClient/tables';

const getAll = async () => {
    const resp = await dbClient.scan({
        TableName: Tables.tournamentWins
    });
    return (resp.Items ?? []) as Array<RoundVictory>;
};

const put = async (item: RoundVictory) => {
    await dbClient.put({
        TableName: Tables.tournamentWins,
        Item: item
    });
};

export const tournamentWinRepository = {
    getAll,
    put
};