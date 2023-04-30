import { MantineProvider } from '@mantine/core';
import { WsContextProvider } from './context/wsContext';
import Tournament from './pages/Tournament';
import { TournamentContextProvider } from './context/TournamentContext';
import { AuthProvider } from './context/AuthContext';

const App = () => (
    <MantineProvider theme={{
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
              <Tournament />
          </TournamentContextProvider>
        </WsContextProvider>
      </AuthProvider>
    </MantineProvider>
);

export default App
