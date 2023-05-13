import creatorData from './creator';
import creatorRepository from '../repository/creatorRepository';
import TwitchAPI from '../twitchApi';
import { roulettePrizes } from './prizes';
import { prizeRepository } from '../repository/prizeRepository';

const twitchApi = new TwitchAPI();

(async () => {
    for (const creator of creatorData) {

        let profileImgUrl = '';
        if (creator.twitch){
            const result = await twitchApi.getUserInfo(creator.twitch);
            if (result) {
                console.log(`using twitch image from ${result.displayName}`);
                profileImgUrl = result.profilePictureUrl;
            }
        }

        await creatorRepository.addCreatorsIfDoesNotExist({
            ...creator,
            profileImgUrl
        });
    }

    for (const prize of roulettePrizes) {
        console.log('adding prize: ', prize.name);
        await prizeRepository.put(prize);
    }
})();