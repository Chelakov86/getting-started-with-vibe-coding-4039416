export type EnergyLevel = 'low' | 'medium' | 'high';

export interface TimeSlot {
  hour: number; // 8-19
  level: EnergyLevel;
}

export const EnergyEmoji: Record<EnergyLevel, string> = {
  low: '🐢',
  medium: '😐',
  high: '🚀',
};

export const EnergyColors: Record<EnergyLevel, string> = {
  low: '#a7f3d0', // Tailwind green-200
  medium: '#fde68a', // Tailwind yellow-200
  high: '#fecaca', // Tailwind red-200
};
