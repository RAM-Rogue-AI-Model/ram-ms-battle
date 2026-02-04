export interface Action {
  type: 'attack' | 'item' | 'defend';
  target_id: string;
}
