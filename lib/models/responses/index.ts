import { RoulletteDisplayType, RoullettePrize } from '../entities';
import { Clip, Creator, Round, RoundPrize } from '../entities';

export type CreatorDto = Omit<Creator, 'fortnite' | 'discord'>
export type ClipDto = Clip

export interface UserDto {
    id: string,
    name: string,
    profilePicture?: string | undefined,
    isAdmin: boolean,
    email: string,
}

export interface RoullettePrizeDto {
    weightCategory: string,
    type: RoulletteDisplayType
}

export interface RoundVictoryDto {
    creatorsWon: Array<CreatorDto>,
    userWon?: {
        id: string,
        name: string,
        profileImage: string
    } | undefined,
    round: Round,
    prize?: RoundPrize | undefined,
}

export interface RoullettePrizeResponse {
    prize: RoullettePrize,
    restriction: number
}