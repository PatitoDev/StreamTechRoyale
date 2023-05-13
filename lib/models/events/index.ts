import { Clip, RoullettePrize, Round, RoundPrize, RoundVictory } from '../entities';
import { CreatorDto, RoullettePrizeDto, RoundVictoryDto } from '../responses';

export type EventType = 'channels-live' | 
    'clip-change' | 
    'tournament-state-change' |
    'creator-change' | 
    'creators-change' |
    'roullette-prize-won' | 
    'roullette-stock-change' | 
    'round-end';

export interface EventBase<TEvent extends EventType = EventType, TData = unknown> {
    content: TData,
    type: TEvent
}

export type ChannelsLiveEvent = EventBase<'channels-live', Array<CreatorDto>>;

export type ClipChangeEvent = EventBase<'clip-change', Clip>;

export interface TournamentState {
    activeRound: Round,
    canPickRepresentation: boolean,
    victories: Array<RoundVictoryDto>
}

export type TournamentStateChangeEvent = EventBase<'tournament-state-change', TournamentState>;

export type CreatorChangeEvent = EventBase<'creator-change', CreatorDto>;

export type RoullettePrizeWonEvent = EventBase<'roullette-prize-won', {
    prize: RoullettePrize,
    user: {
        id: string,
        name: string,
        profilePicture: string
    }
}>;

export type RoulletteStockChange = EventBase<'roullette-stock-change', Array<RoullettePrizeDto>>
export type CreatorsChangeEvent = EventBase<'creators-change', Array<CreatorDto>>

export type RoundEndEvent = EventBase<'round-end', RoundEndEventPayload>;

export interface RoundEndEventPayload {
    creatorsWon: Array<CreatorDto>,
    userWon?: {
        id: string,
        name: string,
        profileImage: string
    } | undefined,
    round: Round,
    prize?: RoundPrize | undefined,
}

