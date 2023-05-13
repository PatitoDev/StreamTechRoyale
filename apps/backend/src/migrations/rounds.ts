import { Round, RoundPrize } from '@streamtechroyale/models';

export const roundPrize: Array<RoundPrize> = [
    { id: 2, name: 'Beca trimestral Membresía PRO ', sponsor: 'Devtalles' },
    { id: 3, name: 'Paquete Cloud Anual', sponsor: 'Donweb Cloud' },
    { id: 4, name: 'Conosola RETRO NES', sponsor: 'Donweb Cloud' },
    { id: 5, name: 'Mochila para portátil de 15,6 pulgadas colores varios', sponsor: 'Codealo' },
    { id: 6, name: 'Soporte RGB para auriculares', sponsor: 'Codealo' },
];

export const rounds: Array<Round> = [
    { id: 1, limitation: 'Solo espadas y pistolas', teamSelection: 'random', type: 'SOLO'},
    { id: 2, limitation: 'Solo ODM Gear y fusil de star wars', teamSelection: 'random', type: 'SOLO'},
    { id: 3, limitation: 'Solo snipers y armas con visor', teamSelection: 'random', type: 'SOLO'},

    { id: 4, limitation: 'Solo pistolas', teamSelection: 'random', type: 'TEAM'},
    { id: 5, limitation: 'Solo espadas y armas con visor', teamSelection: 'picked', type: 'TEAM'},
    { id: 6, limitation: 'Todo permitido', teamSelection: 'picked', type: 'TEAM'}
];