import { Flex, Text, Button } from '@mantine/core';
import { useAuth } from '../../../context/AuthContext/useAuth';
import RepresentationModal from '../RepresentationModal';
import { useDisclosure } from '@mantine/hooks';
import { useTournamentContext } from '../../../context/TournamentContext/useTournamentContext';
import { useMemo } from 'react';
import { CreatorDto } from '@streamtechroyale/models';

export interface HeaderProps {
    creator?: CreatorDto | null,
}

const Header = ({ creator }: HeaderProps) => {
    const { auth, authenticate } = useAuth();
    const [opened, { open, close }] = useDisclosure(false);
    const { creators,tournamentState: { canPickRepresentation, activeRound } } = useTournamentContext();

    const userRepsentedBy = creators.find((item) => item.id === auth?.representation?.creatorId);

    const isRepresentedBySame = useMemo(() => {
        if (!creator) return false;
        if (activeRound.type === 'SOLO') {
            return creator.id === userRepsentedBy?.id;
        }
        return creator.teamId === userRepsentedBy?.teamId;
    }, [activeRound, creator, userRepsentedBy]);

    const onOpenClick = () => {
        if (!auth) {
            authenticate();
            return;
        }
        open();
    };

    return (
        <>
            {creator && (
                <RepresentationModal creator={creator} centered opened={opened} onClose={close} />
            )}
            <Flex mb="0.5em" px="0.5em" align="center">
                {!auth?.representation && (
                    <>
                        <Button disabled={!canPickRepresentation} mr="1em" onClick={onOpenClick} >Elejir streamer</Button>
                        {canPickRepresentation && (
                            <Text weight="bold">
                    Elije a tu creador favorito y si gana obtendras la oportunidad de ganar premios. 
        Solo puede representarte un streamer/equipo por ronda
                            </Text>)}
                        {!canPickRepresentation && (
                            <Text weight="bold">Espera a la siguiente ronda para elejir que streamer te representara</Text>
                        )}

                    </>
                )}

                {userRepsentedBy && (
                    <Flex align="center" gap="lg">
                        <Flex direction="column">
                            <Text><b>{userRepsentedBy.name}</b> te esta representando</Text>
                            <Text>Si gana se sorteara el premio entre los representados</Text>
                        </Flex>
                        {creator && canPickRepresentation && !isRepresentedBySame && (
                            <Button onClick={open}>Cambiar a {creator?.name}</Button>
                        )}
                    </Flex>
                )}
            </Flex>
        </>
    );
};

export default Header;