import { Clip } from '@streamtechroyale/models';
import { clipRepository } from '../repository/clipRepository';
import TwitchAPI from '../twitchApi';


(async () => {
    const twitchApi = new TwitchAPI();
    const channelName = 'niv3k_el_pato';

    const channelClips = await twitchApi.getClipsFromChannel(channelName) ?? [];
    console.log(`found ${channelClips.length} for: niv3k_el_pato`);
    const mappedClips = channelClips.map((clip) => ({
        creatorId: 'asdas',
        clippedById: clip.creatorId,
        clippedByName: clip.creatorDisplayName,
        id: clip.id,
        name: clip.title,
        likes: 0,
        thumbnailUrl: clip.thumbnailUrl
    } satisfies Clip));

    for (const clip of mappedClips) {
        await clipRepository.putClip(clip);
    }
})();