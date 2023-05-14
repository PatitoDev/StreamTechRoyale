import { Divider, Text } from '@mantine/core';
import { loadFull } from 'tsparticles';
import WinHistory from '../../components/WinHistory';
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { particleOptions } from '../../particlesOptions';
import type { Engine } from 'tsparticles-engine';
import NavBar from '../../components/NavBar';


const TOURNAMENT_DATE = 1684008000;

const dateParsed = new Date(TOURNAMENT_DATE * 1000).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    year: 'numeric',
    minute: '2-digit',
    hourCycle: 'h12',
});

const History = () => {

    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    return (
        <>
            <Particles 
                init={particlesInit}
                width="100%"
                height="100%"
                options={particleOptions}
            />
            <NavBar />
            <Text align="center" size="2em" weight="bold">Stream Tech Royale</Text>
            <Text align="center" size="1.5em">Fortnite Edition</Text>
            <Text align="center">Torneo {dateParsed}</Text>
            <Divider mt="lg" size="lg" color="gray" />
            <WinHistory />
        </>
    );
};

export default History;