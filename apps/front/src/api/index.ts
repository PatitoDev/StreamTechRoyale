import { CreatorDto, Clip, UserDto, UserRepresentation, Round, ApiException, NotFoundException, AuthorizationException, AuthenticationException, BadRequestException, RoullettePrize, Creator, TournamentState, StateChangeRequest, EndRoundRequest, RoullettePrizeDto, RoullettePrizeResponse, RoulletteRestriction, UserClipLiked } from '@streamtechroyale/models';


//const API_URL = 'http://localhost:8090/';
const API_URL = 'https://api.streamtechroyale.com/';

export interface ApiResponse<T = null> {
    data?: T,
    error?: ApiException | null,
}

const createHeaders = (token: string) => {
    const header = new Headers();
    header.append('Authorization', `Bearer ${token}`);
    header.append('Content-Type', 'application/json');
    return header;
};

const getActiveCreators = async ():Promise<ApiResponse<CreatorDto[]>> => {
    const resp = await fetch(API_URL + 'creator/active');
    if (!resp.ok) throw new Error();

    return await mapResponse<CreatorDto[]>(resp);
};

const getCreators = async (token: string):Promise<ApiResponse<Creator[]>> => {
    const resp = await fetch(API_URL + 'creator',{
        headers: createHeaders(token)
    });
    if (!resp.ok) throw new Error();

    return await mapResponse<Creator[]>(resp);
};

const updateCreator = async (token: string, id: string, creator: CreatorDto) => {
    const resp = await fetch(API_URL + `creator/${id}`, {
        method: 'PATCH',
        headers: createHeaders(token),
        body: JSON.stringify(creator)
    });
    if (!resp.ok) throw new Error();
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

const getLikedClips = async (token: string):Promise<ApiResponse<Array<UserClipLiked>>> => {
    const resp = await fetch(API_URL + 'user/me/likedClips', {
        headers: createHeaders(token),
    });

    return await mapResponse<Array<UserClipLiked>>(resp);
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

const getTournamentState = async () => {
    const resp = await fetch(API_URL + 'tournament/state');
    return await mapResponse<TournamentState>(resp);
};

const setTournamentState = async (state: StateChangeRequest, token: string): Promise<ApiResponse> => {
    const resp = await fetch(API_URL + 'tournament/state', {
        headers: createHeaders(token),
        method: 'PATCH',
        body: JSON.stringify(state)
    });
    return await mapResponse(resp);
};

const getAllRounds = async (token: string): Promise<ApiResponse<Round[]>> => {
    const resp = await fetch(API_URL + 'tournament/round', {
        headers: createHeaders(token),
    });

    return await mapResponse(resp);
};

const playRoullette = async (token: string): Promise<ApiResponse<RoullettePrizeResponse>> => {
    const resp = await fetch(API_URL + 'roullette/play', {
        headers: createHeaders(token),
        method: 'POST'
    });
    return await mapResponse(resp);
};

const getRestriction = async (token: string):Promise<ApiResponse<RoulletteRestriction | undefined>> => {
    const resp = await fetch(API_URL + 'roullette/restriction', {
        headers: createHeaders(token)
    });
    return await mapResponse(resp);
};

const getPrizesForRoullette = async (): Promise<ApiResponse<Array<RoullettePrizeDto>>> => {
    const resp = await fetch(API_URL + 'roullette');
    return await mapResponse(resp);
};

const endTournamentRound = async (token:string, winnerCreatorId: string):Promise<ApiResponse> => {
    const resp = await fetch(API_URL + 'tournament/round/end', {
        headers: createHeaders(token),
        method: 'POST',
        body: JSON.stringify({
            creatorWonId: winnerCreatorId
        } satisfies EndRoundRequest)
    });
    return await mapResponse(resp);
};

const mapResponse = async <T = null>(res: Response):Promise<ApiResponse<T>> => {
    try {
        const error = await handleErrorException(res);
        if (error) return { error };
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
        const content = await res.text();
        body = content;
    } catch (er) {
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
    getRestriction,
    endTournamentRound,
    updateCreator,
    getAllRounds,
    getActiveCreators,
    getTournamentState,
    setTournamentState,
    createTeams,
    getCreators,
    getClips,
    likeClip,
    dislikeClip,
    getLikedClips,
    validateToken,
    apiAuthentication,
    getUserRepresentation,
    setUserRepresentation,
    playRoullette,
    getPrizesForRoullette
};