import { Clip } from '../entities';
import { CreatorDto } from '../responses';

export type EventType = 'channels-live' | 'clip-change';

export interface EventBase<TEvent extends EventType = EventType, TData = unknown> {
    content: TData,
    type: TEvent
}

export interface ChannelsLiveEvent extends EventBase<'channels-live', Array<CreatorDto>>{};

export interface ClipChangeEvent extends EventBase<'clip-change', Clip>{};