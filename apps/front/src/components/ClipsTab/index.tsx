import { Button, Flex, Pagination, Text, TextInput } from "@mantine/core";
import { Clip, ClipChangeEvent } from "@streamtechroyale/models";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Api } from "../../api";
import ChannelClip from "./ChannelClip";
import { useWsContext } from "../../context/wsContext/useWsContext";

const ITEMS_PER_PAGE = 12;

interface ClipsWithLikeInformation extends Clip {
    hasLiked: boolean
}

const ClipsTab = () => {
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
        } satisfies ClipsWithLikeInformation))
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
            })
        });

        (async () => {
            const clipsResp = await Api.getClips();
            if (clipsResp.data) {
                setClips(clipsResp.data);
            }

            const likedClipsResp = await Api.getLikedClips();
            if (likedClipsResp.data) {
                setLikedClips(likedClipsResp.data);
            }
        })()
    }, []);

    const onLikedClip = useCallback(async (clip: ClipsWithLikeInformation) => {
        if (!clip.hasLiked) {
            await Api.likeClip(clip.id);
            setLikedClips((prev) => ([...prev, clip.id]));
            return;
        }
        await Api.dislikeClip(clip.id);
        setLikedClips((prev) => (prev.filter((item) => item !== clip.id)));
    }, [])

    return (
        <Flex direction="column" align="center">
            <Text weight="bold">El clip mas votado ganara un premio al final del torneo</Text>
            <Flex mt="0.5em">
                <TextInput mr="0.5em" />
                <Button>Enviar</Button>
            </Flex>
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
    )
}

export default ClipsTab;