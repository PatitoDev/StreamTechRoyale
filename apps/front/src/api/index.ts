import { CreatorDto, Clip, UserDto } from '@streamtechroyale/models';

const API_URL = 'http://localhost:8090/';
//const API_URL = 'https://api.streamtechroyale.com/';

export interface ApiResponse<T> {
    data?: T,
    error?: string,
    status: number,
}

const createHeaders = (token: string) => {
    const header = new Headers();
    header.append('Authorization', `Bearer ${token}`);
    return header;
}

const getCreators = async ():Promise<ApiResponse<CreatorDto[]>> => {
    const resp = await fetch(API_URL + 'creators');
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    return { data, status: resp.status };
}

const getClips = async ():Promise<ApiResponse<Clip[]>> => {
    const resp = await fetch(API_URL + 'clips');
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    return { data, status: resp.status }
}

const likeClip = async (clipId: string, token: string):Promise<ApiResponse<Clip>> => {
    const resp = await fetch(API_URL + `user/me/clip/${clipId}/like`, {
        method: 'POST',
        headers: createHeaders(token),
    });

    const data = await resp.json() as Clip;
    return { data, status: resp.status };
}

const dislikeClip = async (clipId: string, token: string):Promise<ApiResponse<Clip>> => {
    const resp = await fetch(API_URL + `user/me/clip/${clipId}/like`, {
        method: 'DELETE',
        headers: createHeaders(token),
    });
    const data = await resp.json() as Clip;
    return { data, status: resp.status };
}

const getLikedClips = async (token: string):Promise<ApiResponse<Array<string>>> => {
    const resp = await fetch(API_URL + `user/me/likedClips`, {
        headers: createHeaders(token),
    });
    const data = (await resp.json()) as Array<{ clipId: string }>;
    return { data: data.map(({clipId}) => clipId), status: resp.status }
}

const validateToken = async (token: string):Promise<ApiResponse<UserDto>> => {
    const resp = await fetch(API_URL + 'auth', {
        headers: createHeaders(token),
    });
    const userData = (await resp.json()) as UserDto;
    return { data: userData, status: resp.status };
}

export const Api = {
    getCreators,
    getClips,
    likeClip,
    dislikeClip,
    getLikedClips,
    validateToken
}