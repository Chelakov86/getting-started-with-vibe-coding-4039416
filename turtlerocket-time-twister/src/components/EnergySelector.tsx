import React from 'react';
import styles from './EnergySelector.module.css';
import { EnergyLevel, HourlyEnergy } from '../types/energy';

interface EnergySelectorProps {
  hourlyEnergy: HourlyEnergy;
  onEnergyChange: (hour: number, level: EnergyLevel) => void;
  onReset: () => void;
}

const hourLabels: { [key: number]: string } = {
  8: '8 AM',
  9: '9 AM',
  10: '10 AM',
  11: '11 AM',
  12: '12 PM',
  13: '1 PM',
  14: '2 PM',
  15: '3 PM',
  16: '4 PM',
  17: '5 PM',
  18: '6 PM',
  19: '7 PM',
};

const energyEmojis: { [key in EnergyLevel]: string } = {
  [EnergyLevel.Low]: '😴',
  [EnergyLevel.Medium]: '🤔',
  [EnergyLevel.High]: '⚡',
};

const EnergySelector: React.FC<EnergySelectorProps> = ({ hourlyEnergy, onEnergyChange, onReset }) => {
  const getNextEnergyLevel = (currentLevel: EnergyLevel): EnergyLevel => {
    switch (currentLevel) {
      case EnergyLevel.Low:
        return EnergyLevel.Medium;
      case EnergyLevel.Medium:
        return EnergyLevel.High;
      case EnergyLevel.High:
        return EnergyLevel.Low;
      default:
        return EnergyLevel.Low;
    }
  };

  const handleBlockClick = (hour: number) => {
    const currentLevel = hourlyEnergy[hour] || EnergyLevel.Low;
    const nextLevel = getNextEnergyLevel(currentLevel);
    onEnergyChange(hour, nextLevel);
  };

  const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8 AM to 7 PM (19:00)

  return (
    <div className={styles.energySelector}>
      <h2>Set Your Hourly Energy Levels</h2>
      <div className={styles.grid}>
        {hours.map((hour) => {
          const level = hourlyEnergy[hour] || EnergyLevel.Low;
          return (
            <button
              key={hour}
              className={`${styles.hourBlock} ${styles[level]}`}
              onClick={() => handleBlockClick(hour)}
              aria-label={`Set energy for ${hourLabels[hour]} to ${level}`}
            >
              <span className={styles.hourLabel}>{hourLabels[hour]}</span>
              <span className={styles.energyEmoji}>{energyEmojis[level]}</span>
            </button>
          );
        })}
      </div>
      <button className={styles.resetButton} onClick={onReset}>
        Reset to Default
      </button>
    </div>
  );
};

export default EnergySelector;
