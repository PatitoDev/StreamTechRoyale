import { Avatar, Badge, Box, Button, Flex, Paper, Stack, Title, UnstyledButton } from "@mantine/core";
import { CreatorDto } from "@streamtechroyale/models";
import { BsCaretRight, BsTiktok, BsTwitch, BsTwitter, BsYoutube } from "react-icons/bs";

interface CreatorCardProps {
    creator: CreatorDto,
    isLive: boolean,
    onCreatorClick?: () => void,
    selected?: boolean,
}

const CreatorCard = ({ isLive, creator, onCreatorClick, selected}: CreatorCardProps) => (
    <Paper key={creator.id} shadow="xs" w={350} mih={90} h={90} bg="dark" sx={{
            boxShadow: selected ? '0 0 0 4px #12b886' : 'none',
            display: 'flex', alignItems: 'center', overflow: 'hidden'
        }}>
        <Avatar m="md" alt={creator.name} src={creator.profileImgUrl} mr="sm" radius="xl" variant="filled" size='lg' display="inline-block" />
        <Stack align='flex-start' spacing={1} sx={{ overflow: 'hidden', width: '100%' }} >
            <Flex align="center" direction="row" w="100%" sx={{maxWidth: '100%'}}>
                <Title w={'100%'} truncate color="white" order={3}>
                    {creator.name}

                </Title>
                { isLive && (
                    <Badge my="auto" sx={{ overflow: 'initial' }} mb="auto" mx="0.9em" variant="filled" color="red">LIVE</Badge>
                )}
            </Flex>
            <Flex gap={0.5}>
                { creator.twitter && (
                    <Button aria-label="Twitter" target="_blank" component="a" href={`https://twitter.com/${creator.twitter}`} variant='subtle' compact color='gray'>
                        <BsTwitter />
                    </Button>
                )}
                { creator.twitch && (
                    <Button aria-label="Twitch" target="_blank" component="a" href={`https://twitch.com/${creator.twitch}`} variant='subtle' compact color='gray'>
                        <BsTwitch />
                    </Button>
                )}
                { creator.youtube && (
                    <Button aria-label="Youtube" target="_blank" component="a" href={`https://youtube.com/creator/${creator.youtube}`} variant='subtle' compact color='gray'>
                        <BsYoutube />
                    </Button>
                )}
                { creator.tiktok && (
                    <Button aria-label="TikTok" target="_blank" component="a" href={`https://www.tiktok.com/${creator.tiktok}`} variant='subtle' compact color='gray'>
                        <BsTiktok />
                    </Button>
                )}
            </Flex>
        </Stack>

        {onCreatorClick && (
            <UnstyledButton onClick={onCreatorClick} px="0.4em" h="100%" 
                aria-label="view twitch channel"
                sx={{
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#505050',
                    marginLeft: 'auto',
                    ":hover": {
                        backgroundColor: '#6D6D6D',
                    }
                }}
            >
                    <BsCaretRight size="1.5em" />
            </UnstyledButton>
        )}
    </Paper>
);

export default CreatorCard;