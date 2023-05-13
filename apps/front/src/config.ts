const clientId= 'rkb30xb65jci7xf9uqq06d6qpadvu5';
const redirectUrl= 'http://localhost:5173';
const codeType: 'token' | 'code' = 'token';

export const config = {
    clientId,
    redirectUrl,
    authUrl: `https://id.twitch.tv/oauth2/authorize?response_type=${codeType}&client_id=${clientId}&redirect_uri=${redirectUrl}&scope=user%3Aread%3Aemail`
};