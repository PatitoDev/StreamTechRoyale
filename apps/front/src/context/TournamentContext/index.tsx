import { ChannelsLiveEvent, CreatorChangeEvent, CreatorDto, CreatorsChangeEvent, EventBase, RoundEndEvent, RoundEndEventPayload, TournamentState, TournamentStateChangeEvent } from '@streamtechroyale/models';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useWsContext } from '../wsContext/useWsContext';
import { Api } from '../../api';
import { Avatar, Divider, Flex, Modal, Text } from '@mantine/core';
import RoundWinCard from '../../components/RoundWinCard';
import SponsorImage from '../../components/Sponsor';

export interface CreatorWithLiveIndicator extends CreatorDto {
    isLive: boolean,
}

export interface CreatorContextState {
    creators: Array<CreatorWithLiveIndicator>,
    tournamentState: TournamentState,
    setWonRoundModal: React.Dispatch<React.SetStateAction<RoundEndEventPayload | null>>,
}

export const TournamentContext = createContext<CreatorContextState | null>(null); 

export const TournamentContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);
    const [channels, setChannels] = useState<Array<CreatorDto>>([]);
    const [liveChannels, setLiveChannels] = useState<Array<CreatorDto>>([]);
    const { subscribeToEvent, desubscribeToEvent } = useWsContext();
    const [hasWonRound, setHasWonRound] = useState<RoundEndEventPayload | null>(null);

    useEffect(() => {
        const onRoundEnd = (e: EventBase) => {
            if (e.type !== 'round-end') return;
            const resp = (e as RoundEndEvent).content;
            setHasWonRound(resp);
        };
        subscribeToEvent('round-end', onRoundEnd);       

        const channelsLiveCallback = (e: EventBase) => {
            if (e.type !== 'channels-live') return;
            const resp = (e as ChannelsLiveEvent).content;
            setLiveChannels(resp);
        };
        subscribeToEvent('channels-live', channelsLiveCallback);

        const onTournamentStateChange = (e: EventBase) => {
            if (e.type !== 'tournament-state-change') return;
            const newState = (e as TournamentStateChangeEvent).content;
            setTournamentState(newState);
        };
        subscribeToEvent('tournament-state-change', onTournamentStateChange);

        const onCreatorChange = (e:EventBase) => {
            if (e.type !== 'creator-change') return;
            const changedCreator = (e as CreatorChangeEvent).content;
            // remove from view if its not active
            if (!changedCreator.isActive) {
                setChannels(prev => prev.filter(item => item.id !== changedCreator.id));
                return;
            }

            setChannels((prev) => (
                [...prev.filter(item => item.id !== changedCreator.id), 
                    changedCreator
                ]
            ));
        };
        subscribeToEvent('creator-change', onCreatorChange);

        const onCreatorsChange = (e:EventBase) => {
            if (e.type !== 'creators-change') return;
            const newCreators = (e as CreatorsChangeEvent).content;
            setChannels(newCreators);
        };

        subscribeToEvent('creators-change', onCreatorsChange);
    }, [subscribeToEvent]);

    useEffect(() => {
        (async () => {
            const respTournamneState = await Api.getTournamentState();
            const respGetCreators = await Api.getActiveCreators();
            if (respTournamneState.data && respGetCreators.data) {
                setChannels(respGetCreators.data);
                setTournamentState(respTournamneState.data);
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

    if (!tournamentState) {
        return null;
    }

    return (
        <TournamentContext.Provider value={{ creators: channelsWithLiveIndicator, tournamentState, setWonRoundModal: setHasWonRound }}>
            <Modal centered size="xl" opened={!!hasWonRound} onClose={() => { setHasWonRound(null);}}>
                {hasWonRound && (
                    <Flex pb="3em" direction="column">
                        <RoundWinCard win={hasWonRound} />
                        { hasWonRound.prize && hasWonRound.userWon && (
                            <>
                                <Divider my="2em" bg="gray" size="lg" />
                                <Flex align="center" direction="column">
                                    <Avatar size="lg" src={hasWonRound.userWon.profileImage} />
                                    <Text size="2em" weight="bold">{hasWonRound.userWon.name} a ganado</Text>
                                    <Text size="1.5em">{hasWonRound.prize.name}</Text>
                                    <Text size="1.5em">Patrocinado por</Text>
                                    <SponsorImage maw="20em" sponsor={hasWonRound.prize.sponsor} />
                                </Flex>
                            </>
                        )}
                        { hasWonRound.prize && !hasWonRound.userWon && (
                            <>
                                <Divider my="2em" bg="gray" size="lg" />
                                <Flex align="center" direction="column">
                                    <Text size="2em" weight="bold">Nadie confio :( El premio va al equipo</Text>
                                    <Text size="1.5em">{hasWonRound.prize.name}</Text>
                                    <Text size="1.5em">Patrocinado por</Text>
                                    <SponsorImage maw="20em" sponsor={hasWonRound.prize.sponsor} />
                                </Flex>
                            </>
                        )}
                    </Flex>
                )}
            </Modal>
            {children}
        </TournamentContext.Provider>
    );
};