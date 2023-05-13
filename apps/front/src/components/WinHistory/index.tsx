import { Box, Divider, Flex, Text } from '@mantine/core';
import { useTournamentContext } from '../../context/TournamentContext/useTournamentContext';
import RoundWinCard from '../RoundWinCard';

const WinHistory = () => {
    const { tournamentState, setWonRoundModal } = useTournamentContext();

    return (
        <Flex direction="column">
            {tournamentState.victories.length === 0 && (
                <Text align="center">Ronda en curso</Text>
            )}

            {tournamentState.victories
                .sort((prev, next) => prev.round.id - next.round.id)
                .map((win, index) => (
                    <Box sx={{cursor: 'pointer'}} onClick={() => setWonRoundModal(win)} py="2em" key={win.round.id}>
                        <RoundWinCard win={win} />
                        {index !== (tournamentState.victories.length  - 1) && (
                            <Divider mt="5em" size="lg" color="gray" />
                        )}
                    </Box>
                ))}
        </Flex>
    );
};

export default WinHistory;