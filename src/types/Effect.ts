export interface Effect {
  id: string;
  stat_name: 'pv' | 'attack' | 'speed';
  count: number;
  modificator: string;
  duration: number;
}
