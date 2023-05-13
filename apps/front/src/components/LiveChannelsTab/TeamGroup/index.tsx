import CreatorCard from '../../CreatorCard';
import { Flex, Text } from '@mantine/core';
import { CreatorWithLiveIndicator } from '../../../context/TournamentContext';

interface TeamGroupProps {
    selectedCreatorId: string | undefined,
    onCreatorClick: (creator:CreatorWithLiveIndicator) => void,
    creators: Array<CreatorWithLiveIndicator>,
    teamId: string,
}

const TeamGroup = (props: TeamGroupProps) => (
    <Flex direction="column" gap="md">
        <Text>Team - {props.teamId}</Text>
        {
            props.creators.map((creator)  => (
                <CreatorCard 
                    creator={creator} 
                    key={creator.id} 
                    selected={creator.id === props.selectedCreatorId} 
                    onCreatorClick={(() => props.onCreatorClick(creator))}
                />
            ))
        }
    </Flex>
);

export default TeamGroup;