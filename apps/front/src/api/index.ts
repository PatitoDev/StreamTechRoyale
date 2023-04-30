import { CreatorDto, Clip } from '@streamtechroyale/models';

const API_URL = 'http://localhost:8090/';
//const API_URL = 'https://api.streamtechroyale.com/';

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

const getClips = async ():Promise<ApiResponse<Clip[]>> => {
    const resp = await fetch(API_URL + 'clips');
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    return { data }
}

const likeClip = async (clipId: string):Promise<ApiResponse<Clip>> => {
    const resp = await fetch(API_URL + `user/me/clip/${clipId}/like`, {
        method: 'POST',
    });
    const data = await resp.json() as Clip;
    return { data };
}

const dislikeClip = async (clipId: string):Promise<ApiResponse<Clip>> => {
    const resp = await fetch(API_URL + `user/me/clip/${clipId}/like`, {
        method: 'DELETE',
    });
    const data = await resp.json() as Clip;
    return { data };
}

const getLikedClips = async ():Promise<ApiResponse<Array<string>>> => {
    const resp = await fetch(API_URL + `user/me/likedClips`);
    const data = (await resp.json()) as Array<{ clipId: string }>;
    return { data: data.map(({clipId}) => clipId) }
}

export const Api = {
    getCreators,
    getClips,
    likeClip,
    dislikeClip,
    getLikedClips
}