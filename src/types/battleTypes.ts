export interface CreateBattleInput {
    playerId: string;
    roomId: string;
}

export interface PerformActionInput {
    action: 'ATTACK' | 'ITEM' | 'DEFENSE';
    targetId?: string;
}
