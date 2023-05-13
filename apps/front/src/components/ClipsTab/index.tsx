import { Button, Flex, Pagination, Text } from '@mantine/core';
import { Clip, ClipChangeEvent, UserClipLiked } from '@streamtechroyale/models';
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
    const [updating, setUpdating] = useState<boolean>(false);

    const totalPages = Math.ceil((clips.length ?? 1) / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;

    const clipsWithLikes = useMemo(() => {
        const mapped = clips.map((clip) => ({
            ...clip,
            hasLiked: !!likedClips.find((likedClipId) => ( likedClipId === clip.id))
        } satisfies ClipsWithLikeInformation));
        return mapped;
    }, [clips, likedClips]);

    const itemsToDisplay = (clipsWithLikes).slice(start, start + ITEMS_PER_PAGE);

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
                setClips(clipsResp.data.sort((prev, next) => next.likes - prev.likes));
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
                setLikedClips(likedClipsResp.data.map(item => item.clipId));
            }
        })();
    }, [auth]);

    const onLikedClip = useCallback(async (clip: ClipsWithLikeInformation) => {
        if (!auth) {
            authenticate();
            return;
        }

        if (!clip.hasLiked) {
            const { error } = await Api.likeClip(clip.id, auth.token);
            if (error) return;
            setClips((prev) => prev
                .map((item) => ({...item, likes: clip.id === item.id ? item.likes + 1 : item.likes }))
            );
            setLikedClips((prev) => ([...prev, clip.id]));
            return;
        }
        const { error } = await Api.dislikeClip(clip.id, auth.token);
        if (error) return;
        setLikedClips((prev) => (prev.filter((item) => item !== clip.id)));
        setClips((prev) => prev
            .map((item) => ({...item, likes: clip.id === item.id ? item.likes - 1 : item.likes }))
        );
    }, [auth]);

    const onRefreshClicked = async () => {
        (async () => {
            setUpdating(true);
            setTimeout(() => {
                setUpdating(false);
            }, 20 * 1000);
            if (auth) {
                const likedClipsResp = await Api.getLikedClips(auth.token);
                if (likedClipsResp.data) {
                    setLikedClips(likedClipsResp.data.map(item => item.clipId));
                }
            }
            const clipsResp = await Api.getClips();
            if (clipsResp.data) {
                setClips(clipsResp.data.sort((prev, next) => next.likes - prev.likes));
            }
        })();
    };

    return (
        <Flex direction="column" align="center">
            <Text weight="bold">El clip mas votado ganara un premio al final del torneo</Text>
            <Button disabled={updating} onClick={onRefreshClicked}>Refresh</Button>
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