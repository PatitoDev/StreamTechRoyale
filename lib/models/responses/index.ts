import { Clip, Creator } from '../entities';

export type CreatorDto = Omit<Creator, 'fortnite' | 'discord'>
export type ClipDto = Clip

export interface UserDto {
    id: string,
    name: string,
    profilePicture?: string | undefined,
    isAdmin: boolean,
}