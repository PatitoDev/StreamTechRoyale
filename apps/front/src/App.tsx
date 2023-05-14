import { MantineProvider } from '@mantine/core';
import { WsContextProvider } from './context/wsContext';
import Tournament from './pages/Tournament';
import { TournamentContextProvider } from './context/TournamentContext';
import { AuthProvider } from './context/AuthContext';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Overlay from './pages/Overlay';
import PreTournament from './pages/PreTournament';
import History from './pages/History';

const App = () => (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{
        primaryColor: 'teal',
        components: {
            Tabs: {
                styles: (theme, params, { variant }) => ({
                    tabsList: {
                        borderColor: '#9C9C9C',
                        borderWidth: '0.2em'
                    },
                    tab: {
                        '&[data-active]': {
                            borderWidth: '0.2em'
                        }
                    }
                }),
            }
        }
    }} >

        <AuthProvider>
            <WsContextProvider>
                <TournamentContextProvider>
                    <Routes /> {/*🦆*/}
                </TournamentContextProvider>
            </WsContextProvider>
        </AuthProvider>
    </MantineProvider>
);

const Routes = () =>  {
    const router = createBrowserRouter([
        { path: '/', element: <PreTournament /> },
        //{ path: '/', element: <Tournament /> },
        { path: '/overlay', element: <Overlay /> },
        { path: '/history', element: <History /> }
    ]);

    return (<RouterProvider router={router} />);
};

export default App;
