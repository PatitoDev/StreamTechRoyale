import { Avatar, Badge, Button, Flex, Paper, Stack, Title } from "@mantine/core";
import { CreatorDto } from "@streamtechroyale/models";
import { BsTwitch, BsTwitter } from "react-icons/bs";

interface CreatorCardProps extends CreatorDto {
    isLive: boolean,
}

const CreatorCard = ({ group, id, name, instagram, twitch, twitter, profileImgUrl, isLive}: CreatorCardProps) => (
    <Paper key={id} shadow="xs" p="md" w={350} h={90} bg="dark">
        <Flex align='center'>
            <Avatar alt={name} src={profileImgUrl} mr="sm" radius="xl" variant="filled" size='lg' display="inline-block" />
            <Stack align='flex-start' spacing={1} maw='25ch'>
                <Title w={'100%'} truncate color="white" order={3}>{name}</Title>
                <Flex gap={0.5}>
                    { twitter && (
                        <Button aria-label="Twitter" target="_blank" component="a" href={`https://twitter.com/${twitter}`} variant='subtle' compact color='gray'>
                            <BsTwitter />
                        </Button>
                    )}
                    { twitch && (
                        <Button aria-label="Twitch" target="_blank" component="a" href={`https://twitch.com/${twitch}`} variant='subtle' compact color='gray'>
                            <BsTwitch />
                        </Button>
                    )}
                </Flex>
            </Stack>
            { isLive && (
                <Badge mb="auto" ml="auto" variant="filled" color="red">LIVE</Badge>
            )}
        </Flex>
    </Paper>
);

export default CreatorCard;