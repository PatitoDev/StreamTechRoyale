import { useEffect, useState } from 'react';
import { useWsContext } from '../../context/wsContext/useWsContext';
import { RoullettePrizeWonEvent } from '@streamtechroyale/models';
import { Avatar, Card, Flex, Paper, Text, Transition } from '@mantine/core';
import SponsorImage from '../../components/Sponsor';

const Overlay = () => {
    const { subscribeToEvent } = useWsContext();
    const [prizeWon, setPrizeWon] = useState<RoullettePrizeWonEvent['content'] | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        subscribeToEvent('roullette-prize-won', (e) => {
            if (e.type !== 'roullette-prize-won') return;
            setPrizeWon((e as RoullettePrizeWonEvent).content);
            setIsOpen(true);
            window.setTimeout(() => {
                setIsOpen(false);
            }, 10 * 1000);
        });
    }, []);

    return (
        <Transition transition="slide-down" mounted={true} >
            {((styles) => (
                <Paper m="md" p="lg" w="28em" h={prizeWon?.prize.sponsor ? '13em' : '9em'} style={styles} shadow='lg' bg="white">
                    {prizeWon && (
                        <Flex justify="center" w="100%" direction="column">
                            <Flex align="center" gap="md">
                                <Avatar size="lg" src={prizeWon.user.profilePicture} />
                                <Text size="lg" >{prizeWon.user.name} a ganado</Text>
                            </Flex>
                            <Text size="lg" weight="bold">
                                {prizeWon.prize.name}
                            </Text>
                            {prizeWon.prize.sponsor && (
                                <Flex align="center" gap="md" my="md">
                                    <Text size="1.5em">Patrocinado por</Text>
                                    <SponsorImage maw="10em" sponsor={prizeWon.prize.sponsor} />
                                </Flex>
                            )}
                        </Flex>

                    )}
                </Paper>
            ))}
        </Transition>
    );
};

export default Overlay;