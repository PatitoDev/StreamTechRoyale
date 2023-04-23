import { MantineProvider } from '@mantine/core';
import PreTournament from './pages/PreTournament'
import { WsContextProvider } from './context/wsContext';

const App = () => (
    <MantineProvider theme={{
      primaryColor: 'teal'
    }} >
      <WsContextProvider>
        <PreTournament />
      </WsContextProvider>
    </MantineProvider>
);

export default App
