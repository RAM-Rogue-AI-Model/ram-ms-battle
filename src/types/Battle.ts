import { Actions, ActionsTour } from './Actions';
import { Effect } from './Effect';
import { Enemy } from './Enemy';
import { Player } from './Player';

export interface Battle {
  id: string;
  enemy: Enemy[];
  effect: Effect[];
  player: Player;
  pv: number;
  level_dungeon: number;
  actions: ActionsTour;
  game_id: string;
  winner: 'player' | 'enemy' | null;
}
