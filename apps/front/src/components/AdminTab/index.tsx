import { Avatar, Button, Checkbox, Flex, Input, Select, Table, Text } from '@mantine/core';
import { Api } from '../../api';
import { useAuth } from '../../context/AuthContext/useAuth';
import { useTournamentContext } from '../../context/TournamentContext/useTournamentContext';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Creator, Round } from '@streamtechroyale/models';

const AdminTab = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [ allRounds, setAllRounds ] = useState<Array<Round>>([]);
    const { tournamentState: { activeRound, canPickRepresentation}, creators } = useTournamentContext();
    const [ selectedActiveRound, setSelectedActiveRound ] = useState<string>('1');
    const [ selectedCreator, setSelectedCreator ] = useState<string | null>(null);
    const [ allCreators, setAllCreators ] = useState<Array<Creator>>([]);
    const { auth } = useAuth();

    useEffect(() => {
        (async () => {
            if (!auth) return;
            setIsLoading(true);
            const allRounds = await Api.getAllRounds(auth.token);
            const allCreators = await Api.getCreators(auth.token);
            if (allCreators.data) {
                setAllCreators(allCreators.data);
            }
            setIsLoading(false);
            if (allRounds.data) {
                setAllRounds(allRounds.data);
            }
        })();
    }, []);

    useEffect(() => {
        if (!activeRound) return;
        setSelectedActiveRound(activeRound.id.toString());
    }, [activeRound]);

    const onRoundChange = async (value: string | null) => {
        if (!value || !auth) return;
        const activeRoundId = parseInt(value);
        if (Number.isNaN(activeRoundId)) return;
        setSelectedActiveRound(value);
        setIsLoading(true);

        await Api.setTournamentState({ activeRoundId }, auth.token);
        const allCreators = await Api.getCreators(auth.token);
        if (allCreators.data) {
            setAllCreators(allCreators.data);
        }
        setIsLoading(false);
    };

    const onCreatorChange = async (value: string | null) => {
        if (!value || !auth) return;
        setSelectedCreator(value);
    };

    const onWinnerPicked = async () => {
        if (!selectedCreator || !auth) return;
        await Api.endTournamentRound(auth.token, selectedCreator);
    };

    const updateCreator = async (id: string, creator: Creator) => {
        if (!auth) return;
        await Api.updateCreator(auth.token, id, creator);
        setAllCreators((prev) => (
            prev.map((item) => (item.id === id) ? creator : item)
        ));
    };

    const onCanPickRepresentationChanged:React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        if (!auth) return;
        await Api.setTournamentState({
            canPickRepresentation: e.target.checked,
        }, auth?.token);
    };

    const membersGroupedAsTeams = useMemo(() => {
        const objMap = allCreators
            .reduce<Record<string, Array<Creator>>>((prev, next) => {
                const id = next.teamId ?? 'none';
                prev[id] = [...prev[id] ?? [], next];
                return prev;
            }, {});
        return Object.entries(objMap)
            .reduce<Array<{teamId: string, members: Array<Creator>}>>((prev, [key, value]) => (
                [...prev, {teamId: key, members: value}]
            ), [])
            .flatMap(item => item.members);
    }, [allCreators]);

    return (
        <Flex direction="column" align="flex-start" gap={10}>
            <Flex gap={20}>
                <Flex direction="column" gap={2}>
                    <Text>Tournament State</Text>
                    <Select w="20em" disabled={isLoading} value={selectedActiveRound} onChange={onRoundChange} data={
                        allRounds.map((item) => ({ 
                            value: item.id.toString(),
                            label: `${item.id} - ${item.type} ${item.teamSelection} - ${item.limitation}` }))
                    } />
                </Flex>
                <Flex direction="column" gap={2}>
                    <Text>Can pick representation</Text>
                    <Checkbox checked={!!canPickRepresentation} onChange={onCanPickRepresentationChanged} />
                </Flex>
            </Flex>
            <Text>Pick Winner</Text>
            <Select 
                searchable
                itemComponent={SelectItem}
                w="50em" disabled={isLoading} value={selectedCreator} onChange={onCreatorChange} data={
                    creators.map((item) => ({ 
                        value: item.id.toString(),
                        label: `${item.id} - ${item.name}`,
                        subLabel: `(Twitch: ${item.twitch})`,
                        image: item.profileImgUrl,
                        group: item.teamId
                    }))
                } />
            <Button onClick={onWinnerPicked} disabled={!selectedCreator || isLoading}>Pick winner and end</Button>

            <Text>Creators</Text>
            <Table striped bg="white">
                <thead>
                    <tr>
                        <th>ProfileImage</th>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Twitch</th>
                        <th>Discord</th>
                        <th>Fortnite</th>
                        <th>Team</th>
                        <th>Type</th>
                        <th>IsActive</th>
                    </tr>
                </thead>
                <tbody>
                    { membersGroupedAsTeams.map((creator) => (
                        <tr key={creator.id}>
                            <td><Avatar src={creator.profileImgUrl} /></td>
                            <td>{creator.id}</td>
                            <td>{creator.name}</td>
                            <td>{creator.twitch}</td>
                            <td>{creator.discord}</td>
                            <td>{creator.fortnite}</td>
                            <td>
                                <TeamIdChange creator={creator} onChange={(c) => updateCreator(c.id, c)} />
                            </td>
                            <td>{creator.group}</td>
                            <td>
                                <Checkbox size="lg" onChange={async (e) => {
                                    const value = e.target.checked;
                                    updateCreator(creator.id, {
                                        ...creator,
                                        isActive: value
                                    });
                                }} checked={creator.isActive} />
                            </td>
                        </tr>
                    ))
                    }
                </tbody>
            </Table>
        </Flex>
    );
};

const TeamIdChange = ({creator, onChange}: { creator: Creator, onChange: (creator: Creator) => void }) => {
    const [value, setValue] = useState<string>(creator.teamId ?? '');

    useEffect(() => {
        setValue(creator.teamId ?? '');
    }, [creator]);

    const onClick = () => {
        onChange({
            ...creator,
            teamId: value
        });
    };

    return (
        <Flex>
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
            <Button onClick={onClick}>Save</Button>
        </Flex>
    );
};

// eslint-disable-next-line react/display-name
const SelectItem = forwardRef((item:{value: string, subLabel: string, label: string, image: string, group: string}, ref: React.Ref<HTMLDivElement>) => (
    <Flex ref={ref} {...item}>
        <Avatar mr={10} src={item.image} /> 
        <Flex direction="column">
            <Text>{item.label}</Text>
            <Text>{item.subLabel}</Text>
        </Flex>
    </Flex>)
);

export default AdminTab;