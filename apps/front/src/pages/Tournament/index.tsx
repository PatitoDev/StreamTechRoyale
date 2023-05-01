import Particles from "react-tsparticles";
import { particleOptions } from "../../particlesOptions";
import { useCallback } from "react";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import { Box, Title, Text, Tabs, Flex, Button, Anchor, Avatar } from "@mantine/core";
import LiveChannelsTab from "../../components/LiveChannelsTab";
import ClipsTab from "../../components/ClipsTab";
import { config } from "../../config";
import { useAuth } from "../../context/AuthContext/useAuth";

const Tournament = () => {
    const { auth, logOut } = useAuth();
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    return (
    <Box>
        <Particles 
            init={particlesInit}
            width="100%"
            height="100%"
            options={particleOptions}
        />
        <Flex align="center">
            <Box p="2em">
                <Box>
                    <Text size="2em" display="inline" weight="bold">Stream Tech Royale</Text>
                    <Text ml="md" size="2em" display="inline">Fortnite edition</Text>
                </Box>

                <Title order={1}>TORNEO EN CURSO - Ronda asd</Title>
            </Box>

            <Box ml="auto" mr="1em">
                { auth ? (
                    <Flex sx={{ alignItems: 'center' }}>
                        <Avatar mr="sm" size="lg" src={auth.user.profilePicture} />
                        <Flex direction="column" align="flex-start">
                            <Text> {auth.user.name} </Text>
                            <Anchor component="button" color="blue" onClick={logOut} >
                                Log Out
                            </Anchor>
                        </Flex>
                    </Flex>
                ) : (
                    <Button color="blue" component="a" href={`${config.authUrl}`} >
                        Twitch Login
                    </Button>
                )}
            </Box>
        </Flex>

        <Tabs defaultValue="live">
            <Tabs.List px="2em">
                <Tabs.Tab value="live">
                    Torneo en vivo
                </Tabs.Tab>
                <Tabs.Tab value="history">
                    Historial de victorias
                </Tabs.Tab>
                <Tabs.Tab value="ruleta">
                    Ruleta
                </Tabs.Tab>
                <Tabs.Tab value="clips">
                    Competicion de clips
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel p="2em" value="live">
                <LiveChannelsTab />
            </Tabs.Panel>

            <Tabs.Panel p="2em" value="history">
                history
            </Tabs.Panel>

            <Tabs.Panel p="2em" value="ruleta">
                ruleta
            </Tabs.Panel>

            <Tabs.Panel p="2em" value="clips">
                <ClipsTab />
            </Tabs.Panel>
        </Tabs>
    </Box>
    );
}

export default Tournament;