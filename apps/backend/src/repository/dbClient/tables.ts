const env = process.env['env'] === 'prd' ? 'prd' : 'dev';

const Tables = {
    clip: `streamtechroyale-${env}-Clip`,
    creator: `streamtechroyale-${env}-Creator`,
    userClipLiked: `streamtechroyale-${env}-UserClipLiked`,
    userRepresentation: `streamtechroyale-${env}-UserRepresentation`,
    prize: `streamtechroyale-${env}-Prize`,
    tournamentWins: `streamtechroyale-${env}-TournamentWins`,
    roulletteWins: `streamtechroyale-${env}-RoulletteWins`,
    roulletteRestriction: `streamtechroyale-${env}-RoulletteRestriction`,
};

export default Tables;