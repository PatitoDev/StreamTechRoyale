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
}

export interface Clip {
    id: string,
    name: string,
    clippedBy: string
    likes: number
}