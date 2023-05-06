import { Creator } from '@streamtechroyale/models';
import dbClient from './dbClient';
import Tables from './tables';
import shortid from 'shortid';

const getCreator = async (creatorId: string) => {
    const result = await dbClient.get({ 
        TableName: Tables.creator,
        Key: { id: creatorId }
    });
    return (result.Item as Creator | undefined);
};

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

const updateCreator = async (creator: Creator) => {
    await dbClient.put({
        TableName: Tables.creator,
        Item: creator
    });
};

export const creatorRepository = {
    getCreator,
    getCreators,
    addCreatorsIfDoesNotExist,
    updateCreator
};

export default creatorRepository;