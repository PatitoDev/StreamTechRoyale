import { CreatorDto } from '@streamtechroyale/models';
import { useState } from 'react';
import { Avatar, Button, Flex, Text } from '@mantine/core';
import { TwitchEmbed } from 'react-twitch-embed';
import { useTournamentContext } from '../../context/TournamentContext/useTournamentContext';
import RepresentationModal from './RepresentationModal';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../../context/AuthContext/useAuth';
import CreatorList from './CreatorList';
import RightPanel from './RightPanel';
import Header from './RightPanel/header';


const LiveChannelsTab = () => {
    const { auth } = useAuth();
    const [opened, { open, close}] = useDisclosure(false);
    const { creators } = useTournamentContext();
    const [selectedCreator, setSelectedCreator] = useState<CreatorDto | null>(null);

    const userRepsentedBy = creators.find((item) => item.id === auth?.representation?.creatorId);

    if (creators.length === 0) return (
        <Flex align="center" justify="center" h="50vh">
            <Text size="2em">
            Estamos apunto de empezar
            </Text>
        </Flex>
    );

    return (
        <Flex 
            direction={{ sm: 'row', base: 'column-reverse', }} h={{ sm: '80vh', base: 'auto' }} sx={{ width: '100%' }}>
            <CreatorList onSelectedCreatorChange={setSelectedCreator} selectedCreator={selectedCreator} />

            <Flex 
                mih={{
                    sm: 'auto',
                    base: '42em'
                }}
                direction="column" px="md" sx={{ flex: '1'}}>
                <Header creator={selectedCreator} />
                <Flex sx={{ flex: '1 100%', borderRadius: '3px', overflow: 'hidden'}} direction="column">
                    {selectedCreator && (
                        <RightPanel creator={selectedCreator} />
                    )}
                    {!selectedCreator && (
                        <Flex bg="grey" h="100%" w="100%" />
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};

export default LiveChannelsTab;