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