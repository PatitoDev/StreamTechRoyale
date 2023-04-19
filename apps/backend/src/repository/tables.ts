// TODO - get from env
const env: 'dev' | 'prd' = 'dev';

const Tables = {
    clip: `streamtechroyale-${env}-Clip`,
    creator: `streamtechroyale-${env}-Creator`
};

export default Tables;