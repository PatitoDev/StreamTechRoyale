import { CreatorDto } from '@streamtechroyale/models';
import { useEffect, useState } from 'react';
import { Api } from '../../api';
import CreatorCard from '../CreatorCard';
import { Avatar, Button, Checkbox, Flex, Pagination, Text, TextInput } from '@mantine/core';
import { TwitchEmbed } from 'react-twitch-embed';
import { useTournamentContext } from '../../context/TournamentContext/useTournamentContext';
import { useStyles } from './styles';
import RepresentationModal from './RepresentationModal';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../../context/AuthContext/useAuth';
import CreatorList from './CreatorList';


const LiveChannelsTab = () => {
    const { auth } = useAuth();
    const [opened, { open, close}] = useDisclosure(false);
    const { classes } = useStyles();
    const { creators } = useTournamentContext();
    const [selectedCreator, setSelectedCreator] = useState<CreatorDto | null>(null);

    const userRepsentedBy = creators.find((item) => item.id === auth?.representation?.creatorId);

    return (
        <Flex 
            direction={{
                sm: 'row',
                base: 'column-reverse',
            }}
            h={{
                sm: '80vh',
                base: 'auto'
            }} sx={{ width: '100%' }}>
            {selectedCreator && (
                <RepresentationModal creator={selectedCreator} centered opened={opened} onClose={close} title="Repseren" />
            )}
            <CreatorList onSelectedCreatorChange={setSelectedCreator} selectedCreator={selectedCreator} />

            <Flex 
                mih={{
                    sm: 'auto',
                    base: '42em'
                }}
                direction="column" px="md" sx={{ flex: '1'}}>
                <Flex mb="0.5em" px="0.5em" align="center">
                    {!auth?.representation && (
                        <>
                            <Button mr="1em" onClick={open} >Apoyar Streamer</Button>
                            <Text weight="bold">
                    Apoya a tu creador favorito y si gana obtendras la oportunidad de ganar premios. 
        Solo puedes apoyar un streamer/equipo por ronda
                            </Text>
                        </>
                    )}
                    {userRepsentedBy && (
                        <Text>
                            {userRepsentedBy.name} te esta representando
                        </Text>
                    )}
                </Flex>
                <Flex sx={{ flex: '1 100%', borderRadius: '3px', overflow: 'hidden'}} direction="column">
                    <Text
                        weight="bold"
                        color="white"
                        bg="dark"
                        p="0.5em 1em"
                    >
                        <Avatar 
                            sx={{verticalAlign: 'middle'}}
                            alt={selectedCreator?.name} 
                            src={selectedCreator?.profileImgUrl} 
                            mr="sm" radius="xl" 
                            variant="filled" 
                            size='sm' 
                            display="inline-block" 
                        />
                        {selectedCreator?.name ?? 'Loading...'}
                    </Text>

                    {selectedCreator && (
                        <TwitchEmbed 
                            className={classes.TwitchContainer}
                            channel={selectedCreator?.twitch}
                            width="100%"
                            height={''}
                        />
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};

export default LiveChannelsTab;