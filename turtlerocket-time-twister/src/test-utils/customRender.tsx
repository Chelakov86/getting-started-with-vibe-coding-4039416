import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here as needed
}

export function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult {
  return render(ui, options);
}

export * from '@testing-library/react';
export { customRender as render };
