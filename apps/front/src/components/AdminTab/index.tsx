import { Button } from '@mantine/core';
import { Api } from '../../api';
import { useAuth } from '../../context/AuthContext/useAuth';
import { useTournamentContext } from '../../context/TournamentContext/useTournamentContext';
import { useEffect, useState } from 'react';
import { Round } from '@streamtechroyale/models';

const AdminTab = () => {
    const [ allRounds, setAllRounds ] = useState<Array<Round>>([]);
    const { activeRound } = useTournamentContext();
    const [ selectedActiveRound, setSelectedActiveRound ] = useState<number>(1);
    const { auth } = useAuth();

    useEffect(() => {
        (async () => {
            if (!auth) return;
            const allRounds = await Api.getAllRounds(auth.token);
            if (allRounds.data) {
                setAllRounds(allRounds.data);
            }
        })();
    }, []);

    useEffect(() => {
        if (!activeRound) return;
        setSelectedActiveRound(activeRound.id);
    }, [activeRound]);

    const onCreateTeam = async () => {
        if (!auth?.token) return;
        await Api.createTeams(auth.token);
    };

    const onChange:React.ChangeEventHandler<HTMLSelectElement> = async (e) => {
        if (!auth) return;
        const value = parseInt(e.target.value);
        setSelectedActiveRound(value);
        await Api.setActiveRound(value, auth.token);
    };

    return (
        <div>
            <Button onClick={onCreateTeam} >Create Teams</Button>
            <select value={selectedActiveRound} onChange={onChange}>
                {allRounds.map((item) => (
                    <option key={item.id} value={item.id}>{item.id} - {item.limitation}</option>
                ))}
            </select>
        </div>
    );
};

export default AdminTab;