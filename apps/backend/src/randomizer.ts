/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Creator } from '@streamtechroyale/models';
import { PreTeams } from './preTeams';

const createPreTeams = (creators: Array<Creator>) => {
    const preTeams = [...PreTeams];
    const creatorsToUpdate = creators.filter((c) => preTeams.some(c2 => c2.name === c.name));
    const updatedCreators = creatorsToUpdate.map((c) => {
        const found = preTeams.find(c2 => c2.name === c.name);
        if (!found) return c;
        return {
            ...c,
            teamId: found.teamId
        };
    });

    const leftToFormTeam = creators.filter((c) => !preTeams.some(c2 => c2.name === c.name));
    const other = createTeams(leftToFormTeam, 9);
    return [...updatedCreators, ...other];
};

const createTeams = (creators: Array<Creator>, offset = 0) => {
    let aGroup = creators.filter(item => item.group === 'A');
    let bGroup = creators.filter(item => item.group === 'B');

    aGroup = shuffleArray(aGroup);
    bGroup = shuffleArray(bGroup);

    const teams: Array<Array<Creator>> = [];

    // create teams of 3 with ABB
    for (const aCreator of aGroup) {
        const bFirst = bGroup.pop();
        const bSecond = bGroup.pop();
        const team = [aCreator];
        if (bFirst) {
            team.push(bFirst);
        }
        if (bSecond) {
            team.push(bSecond);
        }
        teams.push(team);
    }

    // BBB
    const teamsLeft = Math.ceil(bGroup.length / 3);
    for (let i = 0; i < teamsLeft; i++) {
        const index = (i) * 3;
        const first = bGroup[index]!;
        const second = bGroup[index + 1];
        const third = bGroup[index + 2];
        const team = [first];
        if (second) {
            team.push(second);
        }
        if (third) {
            team.push(third);
        }
        if (team.length === 1) {
            teams.at(-1)!.push(first);
            continue;
        }
        teams.push(team);
    }

    teams.forEach((team, index) => {
        team.forEach(team => {
            team.teamId = (index + offset).toString();
        });
    });

    return teams.flat();
};

const shuffleArray = <T>(array: Array<T>) => {
    let m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m]!;
        array[m] = array[i]!;
        array[i] = t;
    }

    return array;
};

export const randomizer = {
    createTeams,
    shuffleArray,
    createPreTeams
};