import { CreatorDto } from '@streamtechroyale/models';
import { useStyles } from './styles';
import { Avatar, Flex, Text } from '@mantine/core';
import { TwitchEmbed } from 'react-twitch-embed';
import { BsInstagram, BsTiktok, BsTwitter, BsYoutube } from 'react-icons/bs';

export interface RightPanelProps {
    creator: CreatorDto
}

const RightPanel = ({ creator }: RightPanelProps) => {
    const { classes } = useStyles();

    return <>
        <Text
            weight="bold"
            color="white"
            bg="dark"
            p="0.5em 1em"
        >
            <Avatar 
                sx={{verticalAlign: 'middle'}}
                alt={creator?.name} 
                src={creator?.profileImgUrl} 
                mr="sm" radius="xl" 
                variant="filled" 
                size='sm' 
                display="inline-block" 
            />
            {creator.name}
        </Text>

        {creator.twitch && (
            <TwitchEmbed 
                className={classes.TwitchContainer}
                channel={creator.twitch}
                width="100%"
                height={''}
            />
        )}

        {!creator.twitch && (
            <Flex direction="column" justify="center" align="center" bg="grey" w="100%" className={classes.TwitchContainer}>
                <Avatar radius="100%" src={creator.profileImgUrl} size="xl" />
                <Text weight="bold" size="xl">{creator.name}</Text>
                {creator.twitter && (
                    <Flex align="center" gap="xs">
                        <BsTwitter/><Text>{creator.twitter}</Text>
                    </Flex>
                )}
                {creator.instagram && (
                    <Flex align="center" gap="xs">
                        <BsInstagram /><Text>{creator.instagram}</Text>
                    </Flex>
                )}
                {creator.tiktok && (
                    <Flex align="center" gap="xs">
                        <BsTiktok/><Text>{creator.tiktok}</Text>
                    </Flex>
                )}
            </Flex>
        )}
    </>;
};

export default RightPanel;