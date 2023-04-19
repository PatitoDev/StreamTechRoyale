import { MantineProvider } from '@mantine/core';
import PreTournament from './pages/PreTournament'

const App = () => (
    <MantineProvider theme={{
      primaryColor: 'teal'
    }} >
      <PreTournament />
    </MantineProvider>
);

export default App
