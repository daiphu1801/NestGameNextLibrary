export interface EmulatorOptions {
  rom: string;
  core?: string;
  size?: {
    width: number;
    height: number;
  };
}

export interface PlayerKeys {
  up: string;
  down: string;
  left: string;
  right: string;
  a: string;
  b: string;
  x: string;
  y: string;
  l: string;
  r: string;
  start: string;
  select: string;
}

export interface KeybindingConfig {
  p1: PlayerKeys;
  p2: PlayerKeys;
}

export interface GamepadButtonMap {
  up: number;
  down: number;
  left: number;
  right: number;
  a: number;
  b: number;
  x: number;
  y: number;
  l: number;
  r: number;
  start: number;
  select: number;
  useAxis: boolean;
}

export interface GamepadConfig {
  p1: GamepadButtonMap;
  p2: GamepadButtonMap;
}

export type NESButton = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'x' | 'y' | 'l' | 'r' | 'start' | 'select';
