import { Creator, CreatorDto, RoundVictory, RoundVictoryDto } from '@streamtechroyale/models';
import { rounds } from '../migrations/rounds';

const toCreatorDto = (item: Creator): CreatorDto => ({
    group: item.group,
    id: item.id,
    name: item.name,
    profileImgUrl: item.profileImgUrl,
    instagram: item.instagram,
    tiktok: item.tiktok,
    twitch: item.twitch,
    twitter: item.twitter,
    youtube: item.youtube,
    teamId: item.teamId,
    isActive: item.isActive
});

export const Mapper = {
    toCreatorDto
};