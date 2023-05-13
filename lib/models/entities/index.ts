import { CreatorDto } from '../responses';

export type GroupCategory = 'A' | 'B';

export interface Creator {
    id: string,
    name: string,
    twitter?: string | undefined,
    instagram?: string | undefined,
    twitch?: string | undefined,
    discord?: string | undefined,
    youtube?: string | undefined,
    tiktok?: string | undefined,
    fortnite: string,
    group: GroupCategory,
    profileImgUrl: string,
    teamId?: string | undefined,
    isActive?: boolean | undefined
}

export interface Clip {
    id: string,
    name: string,
    creatorId: string,
    clippedByName: string,
    clippedById: string,
    likes: number,
    thumbnailUrl: string
}

export interface UserClipLiked {
    /**
     * Partition Key
     */
    userId: string,
    /**
     * Sort Key
     */
    clipId: string
}

export interface UserRepresentation {
    /**
     * Partition Key
     */
    creatorId: string,

    /**
     * Sort Key
     */
    userId: string,
}

export interface Round {
    id: number,
    type: 'SOLO' | 'TEAM',
    limitation: string,
    teamSelection: 'random' | 'picked'
}

export type ProbabilityCategory = 'A' | 'B' | 'C' | 'D';
export type RoulletteDisplayType = 'Beca' | 'Sorpresa' | 'Paquete Cloud' | 'Gadget' | 'Accessory' | 'Gira otra vez!' | 'Espera 30m';

export interface RoundVictory {
    roundId: number,
    round: Round,
    creatorsWon: Array<CreatorDto>,
    userWon?: {
        id: string,
        name: string,
        profileImage: string
    } | undefined,
}

export interface RoullettePrize {
    id: string,
    name: string,
    amount: number,
    limited: boolean,
    sponsor: Sponsor | null,
    category: ProbabilityCategory,
    type: RoulletteDisplayType
}

export interface RoulletteWin {
    id: string,
    prizeName: string,
    userId: string,
    userName: string,
    userEmail: string,
    prize: RoullettePrize,
}

export interface RoundPrize {
    id: number,
    name: string,
    sponsor: Sponsor
}

export interface RoulletteRestriction {
    userId: string,
    restrictValue: number,
}

export type Sponsor = 'Devtalles' | 'Donweb Cloud' | 'Codealo';