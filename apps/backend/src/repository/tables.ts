const env = process.env['env'] === 'prd' ? 'prd' : 'dev';

const Tables = {
    clip: `streamtechroyale-${env}-Clip`,
    creator: `streamtechroyale-${env}-Creator`
};

export default Tables;