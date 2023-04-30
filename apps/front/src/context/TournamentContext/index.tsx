import { ChannelsLiveEvent, CreatorDto, EventBase } from "@streamtechroyale/models";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useWsContext } from "../wsContext/useWsContext";
import { Api } from "../../api";

interface CreatorWithLiveIndicator extends CreatorDto {
    isLive: boolean,
}

export interface CreatorContextState {
    creators: Array<CreatorWithLiveIndicator>,
}

export const TournamentContext = createContext<CreatorContextState | null>(null); 

export const TournamentContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [channels, setChannels] = useState<Array<CreatorDto>>([]);
    const [liveChannels, setLiveChannels] = useState<Array<CreatorDto>>([]);
    const { subscribeToEvent, desubscribeToEvent } = useWsContext();

    useEffect(() => {
        const channelsLiveCallback = (e: EventBase) => {
            if (e.type !== 'channels-live') return;
            const resp = (e as ChannelsLiveEvent).content;
            setLiveChannels(resp);
        }
        subscribeToEvent('channels-live', channelsLiveCallback);
    }, [])

    useEffect(() => {
        (async () => {
            const resp = await Api.getCreators();
            if (!resp.data) return;
            setChannels(resp.data)
        })();
    }, []);

    const channelsWithLiveIndicator = useMemo(() =>  {
        return channels.map((creator) => {
            const isLive = liveChannels.find((liveChannel) => liveChannel.id === creator.id);
            return {
                ...creator,
                isLive: !!isLive
            }
        })
        .sort((prev, next) => (next.isLive ? 0 : -1))
    }, [channels, liveChannels])

    return (
        <TournamentContext.Provider value={{ creators: channelsWithLiveIndicator }}>
            {children}
        </TournamentContext.Provider>
    )
}