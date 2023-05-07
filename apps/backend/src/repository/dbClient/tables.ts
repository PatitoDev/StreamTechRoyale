const env = process.env['env'] === 'prd' ? 'prd' : 'dev';

const Tables = {
    clip: `streamtechroyale-${env}-Clip`,
    creator: `streamtechroyale-${env}-Creator`,
    userClipLiked: `streamtechroyale-${env}-UserClipLiked`,
    userRepresentation: `streamtechroyale-${env}-UserRepresentation`
};

export default Tables;