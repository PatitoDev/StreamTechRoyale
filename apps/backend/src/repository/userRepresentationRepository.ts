import { UserRepresentation } from '@streamtechroyale/models';
import Tables from './tables';
import dbClient from './dbClient';

const getByUser = async (userId: string) => {
    const result = await dbClient.query({
        TableName: Tables.userRepresentation,
        IndexName: 'userId-index',
        KeyConditions: {
            userId: { ComparisonOperator: 'EQ', AttributeValueList: [userId] }
        }

    });
    return (result.Items?.at(0) as UserRepresentation | undefined);
};

const getByCreator = async (creatorId: string) => {
    const result = await dbClient.query({
        TableName: Tables.userRepresentation,
        KeyConditions: {
            creatorId: { ComparisonOperator: 'EQ', AttributeValueList: [creatorId] } 
        }
    });
    return (result.Items ?? []) as Array<UserRepresentation>;
};

const getAll = async () => {
    return (await dbClient.scan({
        TableName: Tables.userRepresentation
    })).Items as Array<UserRepresentation>;
};

const put = async (userId: string, creatorId: string) => {
    await dbClient.put({
        TableName: Tables.userRepresentation,
        Item: { userId, creatorId },
    });
};

const deleteItem = async (userId: string, creatorId: string) => {
    await dbClient.delete({
        TableName: Tables.userRepresentation,
        Key: {
            userId,
            creatorId
        }
    });
};

const deleteAll = async () => {
    const items = await getAll();
    for (const item of items) {
        await deleteItem(item.userId, item.creatorId);
    }
};

export const userRepresentationRepository = {
    getByCreator,
    getByUser,
    getAll,
    put,
    deleteItem,
    deleteAll
};