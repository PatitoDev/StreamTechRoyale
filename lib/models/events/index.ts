import { Clip, Round } from '../entities';
import { CreatorDto } from '../responses';

export type EventType = 'channels-live' | 'clip-change' | 'tournament-state-change';

export interface EventBase<TEvent extends EventType = EventType, TData = unknown> {
    content: TData,
    type: TEvent
}

export type ChannelsLiveEvent = EventBase<'channels-live', Array<CreatorDto>>;

export type ClipChangeEvent = EventBase<'clip-change', Clip>;

export interface TournamentState {
    activeRound: Round,
    creators: Array<CreatorDto>
}

export type TournamentStateChangeEvent = EventBase<'tournament-state-change', TournamentState>;