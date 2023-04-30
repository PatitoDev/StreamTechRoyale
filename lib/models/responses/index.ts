import { Clip, Creator } from "../entities";

export interface CreatorDto extends Omit<Creator, 'fortnite' | 'discord'> {
}
export interface ClipDto extends Clip {}

export interface UserDto {
    id: string,
    name: string,
    expires: number,
}