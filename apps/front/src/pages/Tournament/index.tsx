import Particles from 'react-tsparticles';
import { particleOptions } from '../../particlesOptions';
import { useCallback, useState } from 'react';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';
import { Box, Title, Text, Tabs, Flex, Button, Anchor, Avatar, Drawer, NavLink } from '@mantine/core';
import LiveChannelsTab from '../../components/LiveChannelsTab';
import ClipsTab from '../../components/ClipsTab';
import { config } from '../../config';
import { useAuth } from '../../context/AuthContext/useAuth';
import { GiHamburgerMenu } from 'react-icons/all';
import AdminTab from '../../components/AdminTab';

type TabsValues = 'live' | 'history' | 'ruleta' | 'clips' | 'admin';
const tabs:Array<{ value: TabsValues, display: string, adminOnly?: boolean }> = [
    { value: 'live', display: 'Torneo en vivo'},
    { value: 'history', display: 'Historial de victorias'},
    { value: 'ruleta', display: 'Ruleta'},
    { value: 'clips', display: 'Competicion de clips'},
    { value: 'admin', display: 'Admin', adminOnly: true },
];

const Tournament = () => {
    const [ selectedTab, setSelectedTab ] = useState<TabsValues>('live');
    const [ isMenuOpened, setIsMenuOpened ] = useState<boolean>(false);
    const { auth, logOut } = useAuth();
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    const onMenuItemClick = (value: TabsValues) => {
        setSelectedTab(value);
        setIsMenuOpened(false);
    };

    return (
        <Box>
            <Drawer opened={isMenuOpened} onClose={() => {setIsMenuOpened(false);}} title="">
            Hello world
                {tabs.map(({value, display}) => (
                    <NavLink key={value} onClick={() => { onMenuItemClick(value); }} label={display} />
                ))}
            </Drawer>
            <Particles 
                init={particlesInit}
                width="100%"
                height="100%"
                options={particleOptions}
            />
            <Flex align="center">
                <Box p="2em">
                    <Box>
                        <Button onClick={() => { setIsMenuOpened(true); }} display={{ sm: 'none', base: 'flex' }} mr="0.5em" compact variant="outline"><GiHamburgerMenu/></Button>
                        <Text size="2em" display="inline" weight="bold">Stream Tech Royale</Text>
                        <Text ml="md" size="2em" display="inline">Fortnite edition</Text>
                    </Box>

                    <Title order={1}>TORNEO EN CURSO - Ronda asd</Title>
                </Box>

                <Box ml="auto" mr="1em"
                    display={{
                        sm: 'flex',
                        base: 'none'
                    }}
                >
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

            <Tabs defaultValue="live" value={selectedTab} onTabChange={(e) => setSelectedTab(e as TabsValues)}>
                <Tabs.List px="2em" display={{
                    sm: 'flex',
                    base: 'none'
                }}>
                    {tabs
                        .filter((tab) => !tab.adminOnly || (tab.adminOnly && auth?.user.isAdmin))
                        .map(({ value, display }) => (
                            <Tabs.Tab key={value} value={`${value}`}>{display}</Tabs.Tab>
                        ))}
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

                {auth?.user.isAdmin && (
                    <Tabs.Panel p="2em" value="admin">
                        <AdminTab />
                    </Tabs.Panel>
                )}
            </Tabs>
        </Box>
    );
};

export default Tournament;