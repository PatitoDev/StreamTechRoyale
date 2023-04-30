import Particles from "react-tsparticles";
import { particleOptions } from "../../particlesOptions";
import { useCallback } from "react";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import { Box, Title, Text, Tabs } from "@mantine/core";
import LiveChannelsTab from "../../components/LiveChannelsTab";
import ClipsTab from "../../components/ClipsTab";

const Tournament = () => {
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
        <Box p="2em">
            <Box>
                <Text size="2em" display="inline" weight="bold">Stream Tech Royale</Text>
                <Text ml="md" size="2em" display="inline">Fortnite edition</Text>
            </Box>

            <Title order={1}>TORNEO EN CURSO - Ronda asd</Title>
        </Box>

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