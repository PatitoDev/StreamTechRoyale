import { Clip, Creator } from "../entities";

export interface CreatorDto extends Omit<Creator, 'fortnite' | 'discord'> {
}
export interface ClipDto extends Clip {}