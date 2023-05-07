import { CreatorDto, Clip, UserDto, UserRepresentation, Round, ApiException, NotFoundException, AuthorizationException, AuthenticationException, BadRequestException } from '@streamtechroyale/models';


const API_URL = 'http://localhost:8090/';
//const API_URL = 'https://api.streamtechroyale.com/';

export interface ApiResponse<T = null> {
    data?: T,
    error?: ApiException | null,
}

const createHeaders = (token: string) => {
    const header = new Headers();
    header.append('Authorization', `Bearer ${token}`);
    return header;
};

const getCreators = async ():Promise<ApiResponse<CreatorDto[]>> => {
    const resp = await fetch(API_URL + 'creator');
    if (!resp.ok) throw new Error();

    return await mapResponse<CreatorDto[]>(resp);
};

const getClips = async ():Promise<ApiResponse<Clip[]>> => {
    const resp = await fetch(API_URL + 'clip');
    if (!resp.ok) throw new Error();

    return await mapResponse<Clip[]>(resp);
};

const likeClip = async (clipId: string, token: string):Promise<ApiResponse<Clip>> => {
    const resp = await fetch(API_URL + `user/me/clip/${clipId}/like`, {
        method: 'POST',
        headers: createHeaders(token),
    });

    return await mapResponse<Clip>(resp);
};

const dislikeClip = async (clipId: string, token: string):Promise<ApiResponse<Clip>> => {
    const resp = await fetch(API_URL + `user/me/clip/${clipId}/like`, {
        method: 'DELETE',
        headers: createHeaders(token),
    });

    return await mapResponse<Clip>(resp);
};

const getLikedClips = async (token: string):Promise<ApiResponse<Array<string>>> => {
    const resp = await fetch(API_URL + 'user/me/likedClips', {
        headers: createHeaders(token),
    });

    return await mapResponse<Array<string>>(resp);
};

const apiAuthentication = async (twitchToken: string):Promise<ApiResponse<
    { user: UserDto, token: string }
>> => {
    const resp = await fetch(API_URL + 'auth', {
        headers: createHeaders(twitchToken),
    });

    return await mapResponse(resp);
};

const validateToken = async (token: string):Promise<ApiResponse> => {
    const resp = await fetch(API_URL + 'auth/validate', {
        headers: createHeaders(token),
    });
    return await mapResponse(resp);
};

const getUserRepresentation = async (token: string):Promise<ApiResponse<UserRepresentation>> => {
    const resp = await fetch(API_URL + 'user/me/representation', {
        headers: createHeaders(token),
    });
    return await mapResponse<UserRepresentation>(resp);
};

const setUserRepresentation = async (token: string, creatorId: string):Promise<ApiResponse<null>> => {
    const resp = await fetch(API_URL + `user/me/representation/${creatorId}`, {
        headers: createHeaders(token),
        method: 'POST'
    });
    return await mapResponse(resp);
};

const createTeams = async (token: string) => {
    const resp = await fetch(API_URL + 'team/create', {
        headers: createHeaders(token),
        method: 'POST'
    });
    return await mapResponse(resp);
};

const getActiveRound = async () => {
    const resp = await fetch(API_URL + 'round/active');
    return await mapResponse<Round>(resp);
};

const getAllRounds = async (token: string): Promise<ApiResponse<Round[]>> => {
    const resp = await fetch(API_URL + 'round', {
        headers: createHeaders(token),
    });

    return await mapResponse(resp);
};

const setActiveRound = async (roundId: number, token: string): Promise<ApiResponse> => {
    const resp = await fetch(API_URL + `round/active/${roundId}`, {
        headers: createHeaders(token),
        method: 'POST'
    });
    return await mapResponse(resp);
};

const mapResponse = async <T = null>(res: Response):Promise<ApiResponse<T>> => {
    try {
        const error = await handleErrorException(res);
        const data = (await res.json()) as T;
        return { data, error };
    } catch {
        try { 
            const error = await handleErrorException(res);
            return { error };
        } catch {
            return { error: new ApiException(500, 'Unexpected error') };
        }
    }
};

const handleErrorException = async (res:Response) => {
    if (res.ok) {
        return null;
    }

    let body: string | undefined = undefined;
    try {
        const content = await res.json();
        if (typeof content === 'string') {
            body = content;
        }
    } catch {
        body = undefined;
    }

    switch(res.status) {
    case 404:
        return new NotFoundException(body);
    case 403:
        return new AuthorizationException(body);
    case 401:
        return new AuthenticationException(body);
    default:
        return new BadRequestException(body);
    }
};

export const Api = {
    getAllRounds,
    setActiveRound,
    getActiveRound,
    createTeams,
    getCreators,
    getClips,
    likeClip,
    dislikeClip,
    getLikedClips,
    validateToken,
    apiAuthentication,
    getUserRepresentation,
    setUserRepresentation
};