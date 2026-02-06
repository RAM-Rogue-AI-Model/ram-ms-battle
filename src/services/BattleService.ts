import { createClient, RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';

import { Action } from '../types/Action';
import { Actions } from '../types/Actions';
import { Battle } from '../types/Battle';
import { CreateBattleInput } from '../types/battleTypes';
import { Enemy } from '../types/Enemy';
import { sendLog } from '../utils/message';
import { config } from '../utils/config';

export class BattleService {
  private redis: RedisClientType;

  constructor() {
    this.redis = createClient({ url: `redis://${config.DATABASE_REDIS}:${config.DATABASE_REDIS_PORT}` });
    this.redis.connect().catch(console.error);
  }
  async createBattle(input: CreateBattleInput) {
    const id = uuidv4();

    const battle: Battle = {
      id,
      ...input,
      actions: {},
      winner: null,
    };
    try {
      await this.redis.set(id, JSON.stringify(battle));
      if (input.game_id) {
        await this.redis.set(input.game_id, id);
      }
      void sendLog('BATTLE', 'INSERT', 'INFO', `Battle created with id: ${id}`);
    } catch {
      void sendLog(
        'BATTLE',
        'INSERT',
        'ERROR',
        `Error creating battle with id: ${id}`
      );
      throw new Error('Error creating battle');
    }
    return battle;
  }

  async getBattle(id: string) {
    try {
      const battle = await this.redis.get(id);
      if (battle === null) {
        void sendLog(
          'BATTLE',
          'OTHER',
          'WARN',
          `Battle not found with id: ${id}`
        );
        return null;
      }
      return JSON.parse(battle) as Battle;
    } catch {
      void sendLog(
        'BATTLE',
        'OTHER',
        'ERROR',
        `Error retrieving battle with id: ${id}`
      );
      throw new Error('Error retrieving battle');
    }
  }

  async performAction(id: string, input: Action) {
    try {
      const battle = await this.getBattle(id);
      if (battle === null) {
        void sendLog(
          'BATTLE',
          'OTHER',
          'WARN',
          `Battle not found with id: ${id}`
        );
        throw new Error('Battle not found');
      }

      battle.effect.forEach((effect) => {
        if (effect.duration <= 0) {
          return;
        }
        effect.duration = effect.duration - 1;

        if (effect.modificator == '+') {
          if (effect.stat_name === 'pv')
            battle.pv = Math.min(battle.pv + effect.count, battle.player.pv);
          else battle.player[effect.stat_name] += effect.count;
        } else if (effect.modificator == 'x') {
          if (effect.stat_name === 'pv')
            battle.pv = Math.min(battle.pv * effect.count, battle.player.pv);
          else battle.player[effect.stat_name] *= effect.count;
        } else if (effect.modificator == '-') {
          if (effect.stat_name === 'pv')
            battle.pv = Math.min(battle.pv - effect.count);
          else battle.player[effect.stat_name] -= effect.count;
        }
      });

      const enemyArrayAttack: Enemy[] = [];
      const enemyArrayDefend: Enemy[] = [];
      battle.enemy.forEach((enemy) => {
        if (enemy.pv > 0) {
          const random = Math.random() * 100;
          if (enemy.probability_attack >= random) {
            enemyArrayAttack.push(enemy);
          } else {
            enemyArrayDefend.push(enemy);
          }
        }
      });

      type Combatant =
        | { type: 'player'; entity: typeof battle.player; action: Action }
        | { type: 'enemy'; entity: Enemy };

      const attackOrder: Combatant[] = [];

      if (input.type === 'attack') {
        attackOrder.push({
          type: 'player',
          entity: battle.player,
          action: input,
        });
      }

      enemyArrayAttack.forEach((enemy) => {
        attackOrder.push({ type: 'enemy', entity: enemy });
      });

      attackOrder.sort((a, b) => b.entity.speed - a.entity.speed);

      const actions: Actions = {};
      if (input.type === 'item') {
        actions.player = { type: 'item', target_id: input.target_id };
      } else if (input.type === 'defend') {
        actions.player = { type: 'defend', target_id: input.target_id };
      }
      enemyArrayDefend.forEach((enemy) => {
        actions[`enemy_${enemy.id}`] = {
          type: 'defend',
          target_id: battle.player.id,
        };
      });
      while (attackOrder.length > 0) {
        const currentAttacker = attackOrder.shift();
        if (!currentAttacker) break;

        if (currentAttacker.type === 'player') {
          const targetId = currentAttacker.action.target_id;
          const target = battle.enemy.find((e) => e.id === targetId);
          if (target && target.pv > 0) {
            const damageReduction = enemyArrayDefend.some(
              (e) => e.id === targetId
            )
              ? 0.5
              : 1;
            const damage = Math.floor(battle.player.attack * damageReduction);
            target.pv -= damage;
            actions.player = currentAttacker.action;

            if (target.pv <= 0) {
              target.pv = 0;
              const indexToRemove = attackOrder.findIndex(
                (c) => c.type === 'enemy' && c.entity.id === targetId
              );
              if (indexToRemove !== -1) {
                attackOrder.splice(indexToRemove, 1);
              }
            }
          }
        } else {
          const enemy = currentAttacker.entity;
          if (enemy.pv > 0 && battle.pv > 0) {
            const damageReduction = input.type === 'defend' ? 0.5 : 1;
            const damage = Math.floor(enemy.attack * damageReduction);
            battle.pv -= damage;
            actions[`enemy_${enemy.id}`] = {
              type: 'attack',
              target_id: battle.player.id,
            };

            if (battle.pv <= 0) {
              battle.pv = 0;
              battle.winner = 'enemy';
              break;
            }
          }
        }
        const enemyIsDead = battle.enemy.every((e) => e.pv <= 0);
        if (enemyIsDead) {
          battle.winner = 'player';
          break;
        }
      }

      const allEnemiesDead = battle.enemy.every((e) => e.pv <= 0);
      if (allEnemiesDead) {
        battle.winner = 'player';
      }

      const lastTurn = Object.keys(battle.actions).length + 1;
      battle.actions[lastTurn] = actions;

      await this.redis.set(id, JSON.stringify(battle));
      void sendLog(
        'BATTLE',
        'UPDATE',
        'INFO',
        `Action performed in battle with id: ${id}`
      );
      return battle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      void sendLog(
        'BATTLE',
        'UPDATE',
        'ERROR',
        `Error performing action in battle with id: ${id} - ${errorMessage}`
      );
      throw new Error('Error performing action in battle');
    }
  }

  async getBattleByGameId(game_id: string) {
    try {
      const battleId = await this.redis.get(game_id);
      if (battleId === null || battleId === '') {
        void sendLog(
          'BATTLE',
          'OTHER',
          'WARN',
          `Battle not found with game_id: ${game_id}`
        );
        return null;
      }
      return await this.getBattle(battleId);
    } catch {
      void sendLog(
        'BATTLE',
        'OTHER',
        'ERROR',
        `Error retrieving battle with game_id: ${game_id} - }`
      );
      throw new Error('Error retrieving battle');
    }
  }

  async deleteBattle(id: string) {
    try {
      const battle = await this.getBattle(id);
      if (battle === null) {
        void sendLog(
          'BATTLE',
          'REMOVE',
          'WARN',
          `Battle not found with id: ${id}`
        );
        throw new Error('Battle not found');
      }
      void sendLog('BATTLE', 'REMOVE', 'INFO', `Battle deleted with id: ${id}`);
      return await this.redis.del(id);
    } catch {
      void sendLog(
        'BATTLE',
        'REMOVE',
        'ERROR',
        `Error deleting battle with id: ${id}`
      );
      throw new Error('Error deleting battle');
    }
  }

  async updateBattle(
    id: string,
    battle: CreateBattleInput
  ): Promise<Battle | null> {
    try {
      const existingBattle = await this.getBattle(id);
      if (existingBattle === null) {
        void sendLog(
          'BATTLE',
          'UPDATE',
          'WARN',
          `Battle not found with id: ${id}`
        );
        throw new Error('Battle not found');
      }
      const updatedBattle: Battle = {
        ...existingBattle,
        ...battle,
        id: existingBattle.id,
        actions: existingBattle.actions,
        winner: existingBattle.winner,
      };
      await this.redis.set(id, JSON.stringify(updatedBattle));
      void sendLog('BATTLE', 'UPDATE', 'INFO', `Battle updated with id: ${id}`);
      return updatedBattle;
    } catch {
      void sendLog(
        'BATTLE',
        'UPDATE',
        'ERROR',
        `Error updating battle with id: ${id}`
      );
      return null;
    }
  }
}
