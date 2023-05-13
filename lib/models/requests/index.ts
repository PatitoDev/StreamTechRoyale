export interface EndRoundRequest {
    creatorWonId: string,
}

export interface StateChangeRequest {
    activeRoundId?: number | undefined,
    canPickRepresentation?: boolean | undefined,
}