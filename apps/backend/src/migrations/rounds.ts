import { Round } from '@streamtechroyale/models';

export const rounds: Array<Round> = [
    { id: 1, limitation: 'Solo espadas', teamSelection: 'random', type: 'SOLO'},
    { id: 2, limitation: 'Solo OEM Gear', teamSelection: 'random', type: 'SOLO'},
    { id: 3, limitation: 'Solo snipers o scoped', teamSelection: 'random', type: 'SOLO'},
    { id: 4, limitation: 'Solo pistolas', teamSelection: 'random', type: 'TEAM'},
    { id: 5, limitation: 'Solo espadas', teamSelection: 'picked', type: 'TEAM'},
    { id: 6, limitation: 'Todo permitido', teamSelection: 'picked', type: 'TEAM'}
];