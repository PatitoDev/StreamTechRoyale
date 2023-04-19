import { Creator } from '@streamtechroyale/models';
import dbClient from './dbClient';
import Tables from './tables';
import shortid from 'shortid';

const getCreators = async () => {
    const result = await dbClient.scan({ TableName: Tables.creator });
    return (result.Items ?? []) as Array<Creator>;
};

const addCreatorsIfDoesNotExist = async (creatorToPush: Omit<Creator, 'id'>) => {
    const result = await dbClient.scan({ TableName: Tables.creator });
    const creators = (result.Items ?? []) as Array<Creator>;
    const foundCreator = creators.find((creator) => creator.name === creatorToPush.name);
    if (foundCreator) { return; }
    // create
    console.log(`Adding ${creatorToPush.name} to db`);
    const id =  shortid.generate();
    await dbClient.put({
        TableName: Tables.creator,
        Item: {
            ...creatorToPush,
            id
        }
    });
};

export const creatorRepository = {
    getCreators,
    addCreatorsIfDoesNotExist
};

export default creatorRepository;