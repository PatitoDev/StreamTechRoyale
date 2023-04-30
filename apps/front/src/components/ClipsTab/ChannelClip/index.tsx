import { Button, Flex, Text, UnstyledButton } from "@mantine/core";
import { Clip } from "@streamtechroyale/models";
import { useEffect, useState } from "react";
import { BsHandThumbsUp, BsHandThumbsUpFill, BsPlay } from "react-icons/bs";
import { TwitchClip } from "react-twitch-embed";
import { Api } from "../../../api";

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
                <TwitchClip width={500} height={300} clip={clip.id} />
            ) : (
                <UnstyledButton 
                    bg="dark"
                    h={300}
                    w={500}
                    onClick={() => setIsActive(true)} 
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    <BsPlay color="white" size="2em" />
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
    )
};

export default ChannelClip;