import { CreatorDto } from "@streamtechroyale/models";
import { useEffect, useState } from "react";
import { Api } from "../../api";
import CreatorCard from "../CreatorCard";
import { Avatar, Box, Button, Checkbox, Flex, Pagination, Text, TextInput } from "@mantine/core";
import { TwitchEmbed } from "react-twitch-embed";
import { useTournamentContext } from "../../context/TournamentContext/useTournamentContext";

const ITEMS_PER_PAGE = 10;

const LiveChannelsTab = () => {
    const { creators } = useTournamentContext();
    const [selectedCreator, setSelectedCreator] = useState<CreatorDto | null>(null);
    const [page, setPage] = useState<number>(1);
    const [searchValue, setSearchValue] = useState<string>('');

    const creatorsPostSearch = creators
        .filter(creator => {
            const searchValueLowercased = searchValue.toLowerCase();
            return creator.name.toLowerCase().includes(searchValueLowercased) ||
            creator.twitch?.toLowerCase().includes(searchValueLowercased) ||
            creator.twitter?.toLowerCase().includes(searchValueLowercased) ||
            creator.youtube?.toLowerCase().includes(searchValueLowercased) ||
            creator.tiktok?.toLowerCase().includes(searchValueLowercased) ||
            creator.instagram?.toLowerCase().includes(searchValueLowercased)
        });

    const totalPages = Math.ceil((creatorsPostSearch.length ?? 1) / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const itemsToDisplay = (creatorsPostSearch).slice(start, start + ITEMS_PER_PAGE);

    useEffect(() => {
        if (selectedCreator === null && creators.length){
            setSelectedCreator(creators[0]);
        }
    }, [creators]);

    return (
    <Flex h="80vh" sx={{ width: '100%' }}>
        <Flex px="0.5em" direction="column" gap="md" sx={{ overflow: 'auto', minWidth: '373px', width: '373px' }}>
            <TextInput 
                label="Buscar"
                value={searchValue}
                onChange={(e) => {
                    setPage(1);
                    setSearchValue(e.target.value)
                }}
            />
            <Checkbox
                label="Ocular muertos"
            />
            { !itemsToDisplay.length && (
                <Text align="center" weight="bold">Creador no fue encontrado</Text>
            )}
            { itemsToDisplay.map((item) => (
                    <CreatorCard key={item.id} selected={item.id === selectedCreator?.id} creator={item} isLive={item.isLive} onCreatorClick={() => {
                        setSelectedCreator(item)
                    }} />
                ))
            }
            <Pagination mx="auto" total={totalPages} value={page} onChange={(newPage) => setPage(newPage)} />
        </Flex>

        <Flex direction="column" px="md" sx={{ flex: '1'}}>
            <Flex mb="0.5em" px="0.5em" align="center">
                <Button mr="1em" >Apoyar Streamer</Button>
                <Text weight="bold">
                    Apoya a tu creador favorito y si gana obtendras la oportunidad de ganar premios. 
        Solo puedes apoyar un streamer/equipo por ronda
                </Text>
            </Flex>
            <Flex sx={{ flex: '1 100%', borderRadius: '3px', overflow: 'hidden'}} direction="column">
                <Text
                    weight="bold"
                    color="white"
                    bg="dark"
                    p="0.5em 1em"
                >
                    <Avatar 
                        sx={{verticalAlign: 'middle'}}
                        alt={selectedCreator?.name} 
                        src={selectedCreator?.profileImgUrl} 
                        mr="sm" radius="xl" 
                        variant="filled" 
                        size='sm' 
                        display="inline-block" 
                    />
                    {selectedCreator?.name ?? 'Loading...'}
                </Text>

                {selectedCreator && (
                    <TwitchEmbed 
                        channel={selectedCreator?.twitch}
                        width="100%"
                        height={"100%"}
                    />
                )}
            </Flex>
        </Flex>
    </Flex>
    );
}

export default LiveChannelsTab;