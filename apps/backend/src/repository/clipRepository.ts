import { Clip } from '@streamtechroyale/models';
import dbClient from './dbClient';
import Tables from './tables';

const putClip = async (clip: Clip) => {
    dbClient.put({
        TableName: Tables.clip,
        Item: clip
    });
};

const increaseLikeByOne = async (clipId: string) => {
    const result = await dbClient.update({
        TableName: Tables.clip,
        Key: { id: clipId },
        ExpressionAttributeValues: { ':inc': 1 },
        UpdateExpression: 'ADD likes :inc',
        ReturnValues: 'ALL_NEW'
    });

    return result.Attributes as Clip;
};

const decreaseLikeByOne = async (clipId: string) => {
    const result = await dbClient.update({
        TableName: Tables.clip,
        Key: { id: clipId },
        ExpressionAttributeValues: { ':inc': -1 },
        UpdateExpression: 'ADD likes :inc',
        ReturnValues: 'ALL_NEW'
    });

    return result.Attributes as Clip;
};

const updateLikes = async (clipId: string, likes: number) => {
    dbClient.update({
        TableName: Tables.clip,
        Key: { id: clipId },
        AttributeUpdates: {
            likes: { Action: 'put', Value: likes },
        },
        ReturnValues: 'ALL_NEW'
    });
};

const getClips = async () => {
    const resp = await dbClient.scan({
        TableName: Tables.clip
    });
    return (resp.Items as Array<Clip>) ?? [];
};

export const clipRepository = {
    putClip,
    getClips,
    updateLikes,
    increaseLikeByOne,
    decreaseLikeByOne
};