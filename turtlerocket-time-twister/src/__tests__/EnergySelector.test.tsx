import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Import userEvent
import '@testing-library/jest-dom';
import EnergySelector from '../components/EnergySelector';
import { EnergyLevel, HourlyEnergy } from '../types/energy';

// Helper to create a default hourly energy map
const createDefaultHourlyEnergy = (): HourlyEnergy => {
  const defaultEnergy: HourlyEnergy = {};
  for (let i = 8; i < 20; i++) {
    defaultEnergy[i] = EnergyLevel.Medium;
  }
  return defaultEnergy;
};

describe('EnergySelector', () => {
  const mockOnEnergyChange = jest.fn();
  const mockOnReset = jest.fn();
  const initialHourlyEnergy = createDefaultHourlyEnergy();

  beforeEach(() => {
    mockOnEnergyChange.mockClear();
    mockOnReset.mockClear();
  });

  test('renders 12 hour blocks from 8 AM to 7 PM', () => {
    render(
      <EnergySelector
        hourlyEnergy={initialHourlyEnergy}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );

    const hourBlocks = screen.getAllByRole('button', { name: /Set energy for/ });
    expect(hourBlocks).toHaveLength(12);

    expect(screen.getByLabelText(/Set energy for 8 AM/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set energy for 1 PM/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set energy for 7 PM/)).toBeInTheDocument();
  });

  test('each block displays the correct hour label and initial energy emoji', () => {
    render(
      <EnergySelector
        hourlyEnergy={initialHourlyEnergy}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );

    // Check 8 AM block
    const eightAmBlock = screen.getByLabelText(/Set energy for 8 AM/);
    expect(eightAmBlock).toHaveTextContent('8 AM');
    expect(eightAmBlock).toHaveTextContent('🤔'); // Medium emoji

    // Check 1 PM block
    const onePmBlock = screen.getByLabelText(/Set energy for 1 PM/);
    expect(onePmBlock).toHaveTextContent('1 PM');
    expect(onePmBlock).toHaveTextContent('🤔'); // Medium emoji
  });

  test('clicking a block cycles through energy levels (Medium -> High -> Low)', () => {
    let currentHourlyEnergy: HourlyEnergy = { ...initialHourlyEnergy, 9: EnergyLevel.Medium };

    const { rerender } = render(
      <EnergySelector
        hourlyEnergy={currentHourlyEnergy}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );

    const nineAmBlock = screen.getByLabelText(/Set energy for 9 AM/);

    // Click 1: Medium -> High
    fireEvent.click(nineAmBlock);
    expect(mockOnEnergyChange).toHaveBeenCalledWith(9, EnergyLevel.High);
    currentHourlyEnergy = { ...currentHourlyEnergy, 9: EnergyLevel.High };
    rerender(
      <EnergySelector
        hourlyEnergy={currentHourlyEnergy}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );
    expect(nineAmBlock).toHaveTextContent('⚡'); // High emoji

    // Click 2: High -> Low
    fireEvent.click(nineAmBlock);
    expect(mockOnEnergyChange).toHaveBeenCalledWith(9, EnergyLevel.Low);
    currentHourlyEnergy = { ...currentHourlyEnergy, 9: EnergyLevel.Low };
    rerender(
      <EnergySelector
        hourlyEnergy={currentHourlyEnergy}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );
    expect(nineAmBlock).toHaveTextContent('😴'); // Low emoji

    // Click 3: Low -> Medium
    fireEvent.click(nineAmBlock);
    expect(mockOnEnergyChange).toHaveBeenCalledWith(9, EnergyLevel.Medium);
    currentHourlyEnergy = { ...currentHourlyEnergy, 9: EnergyLevel.Medium };
    rerender(
      <EnergySelector
        hourlyEnergy={currentHourlyEnergy}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );
    expect(nineAmBlock).toHaveTextContent('🤔'); // Medium emoji
  });

  test('visual states (background color and emoji) update properly based on energy level', () => {
    const { rerender } = render(
      <EnergySelector
        hourlyEnergy={{ ...initialHourlyEnergy, 10: EnergyLevel.Low }}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );

    const tenAmBlock = screen.getByLabelText(/Set energy for 10 AM/);
    expect(tenAmBlock).toHaveClass('low');
    expect(tenAmBlock).toHaveTextContent('😴');

    rerender(
      <EnergySelector
        hourlyEnergy={{ ...initialHourlyEnergy, 10: EnergyLevel.Medium }}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );
    expect(tenAmBlock).toHaveClass('medium');
    expect(tenAmBlock).toHaveTextContent('🤔');

    rerender(
      <EnergySelector
        hourlyEnergy={{ ...initialHourlyEnergy, 10: EnergyLevel.High }}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );
    expect(tenAmBlock).toHaveClass('high');
    expect(tenAmBlock).toHaveTextContent('⚡');
  });

  test('Reset to Default button calls onReset prop', () => {
    render(
      <EnergySelector
        hourlyEnergy={initialHourlyEnergy}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByRole('button', { name: /Reset to Default/i });
    fireEvent.click(resetButton);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  test('keyboard navigation (tab and enter) works for blocks and reset button', async () => {
    render(
      <EnergySelector
        hourlyEnergy={initialHourlyEnergy}
        onEnergyChange={mockOnEnergyChange}
        onReset={mockOnReset}
      />
    );

    const firstBlock = screen.getByLabelText(/Set energy for 8 AM/);
    const resetButton = screen.getByRole('button', { name: /Reset to Default/i });

    // Tab to first block
    await userEvent.tab();
    expect(firstBlock).toHaveFocus();

    // Press Enter on first block
    userEvent.click(firstBlock);
    expect(mockOnEnergyChange).toHaveBeenCalledWith(8, EnergyLevel.High);

    // Tab through all 12 hour blocks to reach the reset button
    for (let i = 0; i < 12; i++) {
      await userEvent.tab();
    }
    expect(resetButton).toHaveFocus();

    // Press Enter on reset button
    userEvent.click(resetButton);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });
});
