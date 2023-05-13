import { Avatar, Flex, Text } from '@mantine/core';
import { RoundVictoryDto } from '@streamtechroyale/models';

export interface RoundWinCardProps {
    win: RoundVictoryDto
}

const RoundWinCard = ({ win }: RoundWinCardProps) => (
    <Flex align="center" key={win.round.id} direction="column">
        <Text size="2em" weight="bold" >Ronda {win.round.id} ganadorx</Text>
        <Text size="1.3em">{win.round.limitation}</Text>
        <Flex justify="center" mt="5em" gap="2em" wrap="wrap" direction="row">
            {win.creatorsWon.map((creator) => (
                <Flex justify="center" align="center" key={creator.id} direction="column">
                    <Avatar size="10em" bg="white" radius="100%" src={creator.profileImgUrl} />
                    <Text size="2em" weight="bold">{creator.name}</Text>
                </Flex>
            ))}
        </Flex>
    </Flex>
);

export default RoundWinCard;