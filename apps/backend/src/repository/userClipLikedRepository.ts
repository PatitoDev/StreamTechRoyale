import dbClient from './dbClient';
import Tables from './tables';
import { UserClipLiked } from '@streamtechroyale/models';

const get = async (userId: string) => {
    const resp = await dbClient.query({
        TableName: Tables.userClipLiked,
        KeyConditions: {
            userId: { AttributeValueList: [userId], ComparisonOperator: 'EQ' },
        },
    });
    return (resp.Items ?? []) as Array<UserClipLiked>;
};

const create = async (clipId: string, userId: string) => {
    await dbClient.put({
        TableName: Tables.userClipLiked,
        Item: {
            clipId,
            userId
        } satisfies UserClipLiked
    });
};

const destroy = async (clipId: string, userId: string) => {
    await dbClient.delete({
        TableName: Tables.userClipLiked,
        Key: {
            clipId,
            userId
        }
    });
};

export const userClipLikedRepository = {
    get,
    create,
    destroy
};