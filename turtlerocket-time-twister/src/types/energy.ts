export enum EnergyLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export type HourlyEnergy = {
  [hour: number]: EnergyLevel;
};