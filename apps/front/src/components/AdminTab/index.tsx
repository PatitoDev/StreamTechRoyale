import { Button } from '@mantine/core';
import { Api } from '../../api';
import { useAuth } from '../../context/AuthContext/useAuth';

const AdminTab = () => {
    const { auth } = useAuth();

    const onCreateTeam = async () => {
        if (!auth?.token) return;
        await Api.createTeams(auth.token);
    };


    return <div>
        <Button onClick={onCreateTeam} >Create Teams</Button>
    </div>;
};

export default AdminTab;