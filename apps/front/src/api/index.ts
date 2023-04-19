import { CreatorDto } from '@streamtechroyale/models';

//const API_URL = 'http://localhost:8090/';
const API_URL = 'https://api.streamtechroyale.com/';

export interface ApiResponse<T> {
    data?: T,
    error?: string
}

const getCreators = async ():Promise<ApiResponse<CreatorDto[]>> => {
    const resp = await fetch(API_URL + 'creators');
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    return { data };
}

export const Api = {
    getCreators
}