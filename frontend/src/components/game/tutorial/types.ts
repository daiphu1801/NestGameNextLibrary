export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TutorialStepType {
  targetSelector: string;
  titleKey: string;
  descKey: string;
  position: 'right' | 'left' | 'bottom' | 'top' | 'bottom-right';
  gradient: string;
}
