import { Avatar, Button, Flex, Group, Modal, ModalProps, Text } from '@mantine/core';
import { CreatorDto } from '@streamtechroyale/models';
import { useState } from 'react';
import { Api } from '../../../api';
import { useAuth } from '../../../context/AuthContext/useAuth';
import { useTournamentContext } from '../../../context/TournamentContext/useTournamentContext';

export interface RepresentationModalProps extends ModalProps {
    creator: CreatorDto
}

const RepresentationModal = ({creator, ...props}: RepresentationModalProps) => {
    const { auth, authenticate,setRepresentation } = useAuth();
    const { creators, tournamentState } = useTournamentContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onYesClick = async () => {
        if (!auth) {
            authenticate();
            return;
        }
        setIsLoading(true);
        const { error } = await Api.setUserRepresentation(auth.token, creator.id);
        if (!error) {
            setRepresentation(creator.id, auth.user.id);
        }
        setIsLoading(false);
        props.onClose();
    };

    return (
        <Modal size="md" {...props}>

            <Flex px="lg" pb="lg" direction="column" gap="1em">

                { tournamentState.activeRound.type === 'SOLO' && (
                    <>
                        <Text weight="bold">Estas seguro que quieres que {creator.name} te represente?</Text>
                        <Flex direction="column" align="center">
                            <Avatar size="xl" radius="100%" src={creator.profileImgUrl} />
                            <Text>{creator.name}</Text>
                        </Flex>
                        <Text weight="bold">
                            Si gana, el premio sera sorteado entre los representados.
                        </Text>
                    </>
                )}

                { tournamentState.activeRound.type === 'TEAM' && (
                    <>
                        <Text weight="bold">Estas seguro que quieres que Team - {creator.teamId} te represente?</Text>
                        <Flex gap="2em" justify="space-between">
                            {creators.filter(item => item.teamId === creator.teamId).map((teamMember) => (
                                <Flex key={teamMember.id} direction="column" align="center">
                                    <Avatar size="xl" radius="100%" src={teamMember.profileImgUrl} />
                                    <Text align='center' >{teamMember.name}</Text>
                                </Flex>
                            ))}
                        </Flex>
                        <Text weight="bold">
                            Si el equipo gana, el premio sera sorteado entre los representados.
                        </Text>
                    </>
                )}



                <Group mt={10} position='center'>
                    <Button loading={isLoading} onClick={onYesClick}>Si</Button>
                    <Button loading={isLoading} onClick={props.onClose} variant='outline'>No</Button>
                </Group>
            </Flex>
        </Modal>
    );
};

export default RepresentationModal;