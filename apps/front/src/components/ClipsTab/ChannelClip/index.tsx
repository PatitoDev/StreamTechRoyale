import { Button, Flex, Text, UnstyledButton, Image } from '@mantine/core';
import { Clip } from '@streamtechroyale/models';
import { useState } from 'react';
import { BsHandThumbsUp, BsHandThumbsUpFill, BsPlay } from 'react-icons/bs';
import { TwitchClip } from 'react-twitch-embed';

export interface ChannelClipProps {
    clip: Clip,
    liked: boolean,
    onLikedClip: () => void
}

const ChannelClip = ({ clip, liked, onLikedClip }: ChannelClipProps) => {
    const [isActive, setIsActive] = useState<boolean>(false);

    return (
        <Flex maw={500} direction="column">
            { isActive ? (
                <TwitchClip height={272} width={480} clip={clip.id} />
            ) : (
                <UnstyledButton 
                    h={272}
                    w={480}
                    onClick={() => setIsActive(true)} 
                    sx={{ 
                        overflow: 'hidden',
                        borderRadius: '5px',
                        position: 'relative',
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center' }}
                >
                    <Flex w="3em" h="3em" sx={{ borderRadius: '5px' }} bg="#25262bd1">
                        <BsPlay style={{margin: 'auto'}} color="white" size="2em" />
                    </Flex>
                    <Image 
                        src={clip.thumbnailUrl} width="100%" height="100%" 
                        sx={{ position: 'absolute', zIndex: -1 }}
                    />
                </UnstyledButton>

            )}
            <Flex align="flex-start" justify="space-between" p="0.5em">
                <Flex direction="column">
                    <Text size="lg">{clip.name}</Text>
                    <Flex gap="0.5em">
                        <Text>Clipeado por:</Text>
                        <Text color="cyan" weight="bold">{clip.clippedByName}</Text>
                    </Flex>
                </Flex>
                <Flex align="center">
                    <Button onClick={onLikedClip} ml={5} p="0.2em" color="blue" variant="subtle" compact size="1.5em">
                        { liked ? 
                            (<BsHandThumbsUpFill />) :
                            (<BsHandThumbsUp />)
                        }
                    </Button>
                    <Text>
                        {clip.likes}
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default ChannelClip;