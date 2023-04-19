import { CreatorDto } from '../responses';

export type EventType = 'channels-live';

export interface EventBase<TEvent extends EventType, TData> {
    content: TData,
    type: TEvent
}

export interface ChannelsLiveEvent extends EventBase<'channels-live', Array<CreatorDto>>{};