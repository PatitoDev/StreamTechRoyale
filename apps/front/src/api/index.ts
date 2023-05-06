import { CreatorDto, Clip, UserDto, UserRepresentation, Round } from '@streamtechroyale/models';

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
};

const getCreators = async ():Promise<ApiResponse<CreatorDto[]>> => {
    const resp = await fetch(API_URL + 'creators');
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    return { data, status: resp.status };
};

const getClips = async ():Promise<ApiResponse<Clip[]>> => {
    const resp = await fetch(API_URL + 'clips');
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    return { data, status: resp.status };
};

const likeClip = async (clipId: string, token: string):Promise<ApiResponse<Clip>> => {
    const resp = await fetch(API_URL + `user/me/clip/${clipId}/like`, {
        method: 'POST',
        headers: createHeaders(token),
    });

    const data = await resp.json() as Clip;
    return { data, status: resp.status };
};

const dislikeClip = async (clipId: string, token: string):Promise<ApiResponse<Clip>> => {
    const resp = await fetch(API_URL + `user/me/clip/${clipId}/like`, {
        method: 'DELETE',
        headers: createHeaders(token),
    });
    const data = await resp.json() as Clip;
    return { data, status: resp.status };
};

const getLikedClips = async (token: string):Promise<ApiResponse<Array<string>>> => {
    const resp = await fetch(API_URL + 'user/me/likedClips', {
        headers: createHeaders(token),
    });
    const data = (await resp.json()) as Array<{ clipId: string }>;
    return { data: data.map(({clipId}) => clipId), status: resp.status };
};

const validateToken = async (token: string):Promise<ApiResponse<
    { user: UserDto, token: string }
>> => {
    const resp = await fetch(API_URL + 'auth', {
        headers: createHeaders(token),
    });
    const userData = (await resp.json()) as {
        user: UserDto, token: string,
    };
    return { data: userData, status: resp.status };
};

const getUserRepresentation = async (token: string):Promise<ApiResponse<UserRepresentation>> => {
    const resp = await fetch(API_URL + 'user/me/representation', {
        headers: createHeaders(token),
    });
    const data = (await resp.json()) as UserRepresentation;
    return { data: data, status: resp.status };
};

const setUserRepresentation = async (token: string, creatorId: string):Promise<ApiResponse<null>> => {
    const resp = await fetch(API_URL + `user/me/representation/${creatorId}`, {
        headers: createHeaders(token),
        method: 'POST'
    });
    return { data: null, status: resp.status };
};

const createTeams = async (token: string) => {
    const resp = await fetch(API_URL + 'team/create', {
        headers: createHeaders(token),
        method: 'POST'
    });
    const data = (await resp.json()) as Array<CreatorDto>;
    return { data, status: resp.status };
};

const getRounds = async () => {
    const resp = await fetch(API_URL + 'rounds');
    const data = (await resp.json()) as Array<Round>;
    return data;
};

export const Api = {
    getRounds,
    createTeams,
    getCreators,
    getClips,
    likeClip,
    dislikeClip,
    getLikedClips,
    validateToken,
    getUserRepresentation,
    setUserRepresentation
};