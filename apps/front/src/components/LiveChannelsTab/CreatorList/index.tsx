import { CreatorDto } from '@streamtechroyale/models';
import { useTournamentContext } from '../../../context/TournamentContext/useTournamentContext';
import { useEffect, useMemo, useState } from 'react';
import { Flex, TextInput, Text, Pagination } from '@mantine/core';
import CreatorCard from '../../CreatorCard';
import { usePagination } from '../../../hooks/usePagination';
import TeamGroup from '../TeamGroup';
import { CreatorWithLiveIndicator } from '../../../context/TournamentContext';

export interface CreatorListProps {
    selectedCreator: CreatorDto | null,
    onSelectedCreatorChange: React.Dispatch<React.SetStateAction<CreatorDto | null>>,
}

const ITEMS_PER_PAGE = 10;

const whereCreatorHasValue = (creator:CreatorWithLiveIndicator, value: string) => {
    const searchValueLowercased = value.toLowerCase();
    return creator.name.toLowerCase().includes(searchValueLowercased) ||
        creator.twitch?.toLowerCase().includes(searchValueLowercased) ||
        creator.twitter?.toLowerCase().includes(searchValueLowercased) ||
        creator.youtube?.toLowerCase().includes(searchValueLowercased) ||
        creator.tiktok?.toLowerCase().includes(searchValueLowercased) ||
        creator.instagram?.toLowerCase().includes(searchValueLowercased);
};

const CreatorList = ({ onSelectedCreatorChange, selectedCreator }:CreatorListProps) => {
    const { tournamentState } = useTournamentContext();
    const { creators } = useTournamentContext();
    const [searchValue, setSearchValue] = useState<string>('');
    const isTeam = tournamentState.activeRound.type === 'TEAM';

    const creatorsPostSearch = useMemo(() => creators
        .filter(creator => ( whereCreatorHasValue(creator, searchValue) ))
    , [creators, searchValue]);

    const teams = useMemo(() => {
        const objMap = creators
            .reduce<Record<string, Array<CreatorWithLiveIndicator>>>((prev, next) => {
                const id = next.teamId ?? 'none';
                prev[id] = [...prev[id] ?? [], next];
                return prev;
            }, {});
        return Object.entries(objMap)
            .reduce<Array<{teamId: string, members: Array<CreatorWithLiveIndicator>}>>((prev, [key, value]) => (
                [...prev, {teamId: key, members: value}]
            ), [])
            .sort((a,) => (a.members.some(member => member.isLive) ? -1 : 0));
    }, [creators]);

    const teamsFiltered = useMemo(() => (
        teams.filter(team => team.members.some((member) => whereCreatorHasValue(member, searchValue)))
    ), [teams, searchValue]);

    const memberPagination = usePagination(creatorsPostSearch, ITEMS_PER_PAGE);
    const teamPagination = usePagination(teamsFiltered, 3);

    const paginationData = isTeam ? teamPagination : memberPagination;

    useEffect(() => {
        if (selectedCreator === null && creators.length){
            onSelectedCreatorChange(creators[0]);
        }
    }, [creators]);

    return (
        <Flex 
            m={{
                base: 'auto',
                sm: 'initial'
            }}
            direction="column" gap="md" sx={{ overflow: 'auto', minWidth: '373px', width: '373px' }}>
            <TextInput 
                label="Buscar"
                value={searchValue}
                onChange={(e) => {
                    isTeam ? teamPagination.onChange(1) : memberPagination.onChange(1);
                    setSearchValue(e.target.value);
                }}
            />
            { !creators.length && !isTeam && !memberPagination.itemsToDisplay.length && (
                <Text align="center" weight="bold">Esperando que empieze la partida</Text>
            )}
            { !!creators.length && !isTeam && !memberPagination.itemsToDisplay.length && (
                <Text align="center" weight="bold">Creador no fue encontrado</Text>
            )}
            { !isTeam && memberPagination.itemsToDisplay.map((item) => (
                <CreatorCard 
                    key={item.id} 
                    selected={item.id === selectedCreator?.id} 
                    creator={item} 
                    onCreatorClick={() => {
                        onSelectedCreatorChange(item);
                    }} />
            )) }

            { isTeam && !teamPagination.itemsToDisplay.length && (
                <Text align="center" weight="bold">Creador no fue encontrado</Text>
            )}
            { isTeam && teamPagination.itemsToDisplay.map(team => (
                <TeamGroup 
                    onCreatorClick={onSelectedCreatorChange}
                    selectedCreatorId={selectedCreator?.id}
                    key={team.teamId} creators={team.members} teamId={team.teamId} />
            ))}

            {paginationData.total > 1 && (
                <Pagination mx="auto" total={paginationData.total} onChange={paginationData.onChange} value={paginationData.page} />
            )}
        </Flex>
    );
};

export default CreatorList;