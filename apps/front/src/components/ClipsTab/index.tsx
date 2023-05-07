import { Flex, Pagination, Text } from '@mantine/core';
import { Clip, ClipChangeEvent } from '@streamtechroyale/models';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Api } from '../../api';
import ChannelClip from './ChannelClip';
import { useWsContext } from '../../context/wsContext/useWsContext';
import { useAuth } from '../../context/AuthContext/useAuth';

const ITEMS_PER_PAGE = 12;

interface ClipsWithLikeInformation extends Clip {
    hasLiked: boolean
}

const ClipsTab = () => {
    const { auth, authenticate } = useAuth();
    const { subscribeToEvent } = useWsContext();
    const [likedClips, setLikedClips] = useState<Array<string>>([]);
    const [clips, setClips] = useState<Array<Clip>>([]);
    const [page, setPage] = useState<number>(1);

    const totalPages = Math.ceil((clips.length ?? 1) / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;

    const clipsWithLikes = useMemo(() => {
        return clips.map((clip) => ({
            ...clip,
            hasLiked: !!likedClips.find((clipId) => clipId === clip.id)
        } satisfies ClipsWithLikeInformation));
    }, [clips, likedClips]);

    const itemsToDisplay = (clipsWithLikes).slice(start, start + ITEMS_PER_PAGE);
    console.log(itemsToDisplay);

    useEffect(() => {
        subscribeToEvent('clip-change', (event) => {
            setClips(prev => {
                const eventParsed = event as ClipChangeEvent;
                return prev.map((item) => ({
                    ...(item.id === eventParsed.content.id ? eventParsed.content : item)
                }));
            });
        });

        (async () => {
            const clipsResp = await Api.getClips();
            if (clipsResp.data) {
                setClips(clipsResp.data);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (!auth) {
                setLikedClips([]);
                return;
            }

            const likedClipsResp = await Api.getLikedClips(auth.token);
            if (likedClipsResp.data) {
                setLikedClips(likedClipsResp.data);
            }
        })();
    }, [auth]);

    const onLikedClip = useCallback(async (clip: ClipsWithLikeInformation) => {
        if (!auth) {
            authenticate();
            return;
        }

        if (!clip.hasLiked) {
            await Api.likeClip(clip.id, auth.token);
            setLikedClips((prev) => ([...prev, clip.id]));
            return;
        }
        await Api.dislikeClip(clip.id, auth.token);
        setLikedClips((prev) => (prev.filter((item) => item !== clip.id)));
    }, [auth]);

    return (
        <Flex direction="column" align="center">
            <Text weight="bold">El clip mas votado ganara un premio al final del torneo</Text>
            <Flex my="1em" justify="center" direction="row" wrap="wrap" gap="1em">
                {
                    itemsToDisplay.map((clip) => (
                        <ChannelClip 
                            onLikedClip={() => onLikedClip(clip)}
                            key={clip.id} clip={clip} liked={clip.hasLiked} 
                        />
                    ))
                }
            </Flex>
            <Pagination total={totalPages} value={page} onChange={setPage} />
        </Flex>
    );
};

export default ClipsTab;