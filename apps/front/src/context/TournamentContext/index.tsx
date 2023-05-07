import { ChannelsLiveEvent, CreatorDto, EventBase, Round, TournamentStateChangeEvent } from '@streamtechroyale/models';
import { createContext, useEffect, useMemo, useState } from 'react';
import { useWsContext } from '../wsContext/useWsContext';
import { Api } from '../../api';

export interface CreatorWithLiveIndicator extends CreatorDto {
    isLive: boolean,
}

export interface CreatorContextState {
    creators: Array<CreatorWithLiveIndicator>,
    activeRound?: Round | null,
}

export const TournamentContext = createContext<CreatorContextState | null>(null); 

export const TournamentContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [activeRound, setActiveRound] = useState<Round | null>(null);
    const [channels, setChannels] = useState<Array<CreatorDto>>([]);
    const [liveChannels, setLiveChannels] = useState<Array<CreatorDto>>([]);
    const { subscribeToEvent, desubscribeToEvent } = useWsContext();

    useEffect(() => {
        const channelsLiveCallback = (e: EventBase) => {
            if (e.type !== 'channels-live') return;
            const resp = (e as ChannelsLiveEvent).content;
            setLiveChannels(resp);
        };
        subscribeToEvent('channels-live', channelsLiveCallback);

        const onTournamentStateChange = (e: EventBase) => {
            if (e.type !== 'tournament-state-change') return;
            const newState = (e as TournamentStateChangeEvent).content;
            setActiveRound(newState.activeRound);
            setChannels(newState.creators);
        };

        subscribeToEvent('tournament-state-change', onTournamentStateChange);
    }, []);

    useEffect(() => {
        (async () => {
            const respActiveRound = await Api.getActiveRound();
            const respGetCreators = await Api.getCreators();
            if (respActiveRound.data && respGetCreators.data) {
                setChannels(respGetCreators.data);
                setActiveRound(respActiveRound.data);
            }
        })();
    }, []);

    const channelsWithLiveIndicator = useMemo(() =>  {
        return channels.map((creator) => {
            const isLive = liveChannels.find((liveChannel) => liveChannel.id === creator.id);
            return {
                ...creator,
                isLive: !!isLive
            };
        })
            .sort((prev, next) => (next.isLive ? 0 : -1));
    }, [channels, liveChannels]);

    return (
        <TournamentContext.Provider value={{ creators: channelsWithLiveIndicator, activeRound }}>
            {children}
        </TournamentContext.Provider>
    );
};