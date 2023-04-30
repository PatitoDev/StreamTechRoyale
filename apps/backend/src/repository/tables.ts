const env = process.env['env'] === 'prd' ? 'prd' : 'dev';

const Tables = {
    clip: `streamtechroyale-${env}-Clip`,
    creator: `streamtechroyale-${env}-Creator`,
    userClipLiked: `streamtechroyale-${env}-UserClipLiked`
};

export default Tables;