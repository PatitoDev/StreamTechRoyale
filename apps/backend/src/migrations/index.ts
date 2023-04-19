import creatorData from './creator';
import creatorRepository from '../repository/creatorRepository';
import TwitchAPI from '../twitchApi';

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
})();