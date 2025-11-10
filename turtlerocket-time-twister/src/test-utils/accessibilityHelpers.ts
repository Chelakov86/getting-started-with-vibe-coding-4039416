import { within, screen } from '@testing-library/react';

export const axeViolations = {
  critical: [] as string[],
  serious: [] as string[],
  moderate: [] as string[],
  minor: [] as string[],
};

export const checkAriaLabels = (container: HTMLElement): string[] => {
  const violations: string[] = [];
  
  const buttons = container.querySelectorAll('button');
  buttons.forEach((button, index) => {
    const hasAriaLabel = button.hasAttribute('aria-label');
    const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');
    const hasTextContent = button.textContent?.trim();
    
    if (!hasAriaLabel && !hasAriaLabelledBy && !hasTextContent) {
      violations.push(`Button at index ${index} has no accessible name`);
    }
  });

  const inputs = container.querySelectorAll('input');
  inputs.forEach((input, index) => {
    const hasLabel = container.querySelector(`label[for="${input.id}"]`);
    const hasAriaLabel = input.hasAttribute('aria-label');
    const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      violations.push(`Input at index ${index} has no accessible label`);
    }
  });

  return violations;
};

export const checkKeyboardNavigation = async (
  container: HTMLElement
): Promise<boolean> => {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );

  return focusableElements.length > 0;
};

export const checkColorContrast = (element: HTMLElement): boolean => {
  const styles = window.getComputedStyle(element);
  const backgroundColor = styles.backgroundColor;
  const color = styles.color;

  // Basic check - in real scenario, would use a proper contrast calculation
  return backgroundColor !== color;
};

export const checkFocusVisible = (element: HTMLElement): boolean => {
  const styles = window.getComputedStyle(element);
  return styles.outline !== 'none' || styles.boxShadow !== 'none';
};

export const getAccessibilityTree = (container: HTMLElement): any => {
  const tree: any = {
    role: container.getAttribute('role') || container.tagName.toLowerCase(),
    name: container.getAttribute('aria-label') || container.textContent?.trim() || '',
    children: [],
  };

  Array.from(container.children).forEach(child => {
    if (child instanceof HTMLElement) {
      tree.children.push(getAccessibilityTree(child));
    }
  });

  return tree;
};

export const checkLandmarks = (container: HTMLElement): string[] => {
  const violations: string[] = [];
  
  const hasMain = container.querySelector('main, [role="main"]');
  if (!hasMain) {
    violations.push('No main landmark found');
  }

  return violations;
};

export const checkHeadingHierarchy = (container: HTMLElement): string[] => {
  const violations: string[] = [];
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1]);
    
    if (index === 0 && level !== 1) {
      violations.push('First heading should be h1');
    }
    
    if (level > previousLevel + 1) {
      violations.push(`Heading level skipped from h${previousLevel} to h${level}`);
    }
    
    previousLevel = level;
  });

  return violations;
};

export const checkFormLabels = (container: HTMLElement): string[] => {
  const violations: string[] = [];
  const formControls = container.querySelectorAll('input, select, textarea');
  
  formControls.forEach((control, index) => {
    const id = control.id;
    const hasLabel = id && container.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = control.hasAttribute('aria-label');
    const hasAriaLabelledBy = control.hasAttribute('aria-labelledby');
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      violations.push(`Form control at index ${index} (${control.tagName}) has no label`);
    }
  });

  return violations;
};

export const checkImageAltText = (container: HTMLElement): string[] => {
  const violations: string[] = [];
  const images = container.querySelectorAll('img');
  
  images.forEach((img, index) => {
    if (!img.hasAttribute('alt')) {
      violations.push(`Image at index ${index} missing alt attribute`);
    }
  });

  return violations;
};

export const simulateScreenReader = (container: HTMLElement): string[] => {
  const announcements: string[] = [];
  const liveRegions = container.querySelectorAll('[aria-live]');
  
  liveRegions.forEach(region => {
    const text = region.textContent?.trim();
    if (text) {
      announcements.push(text);
    }
  });

  return announcements;
};

export const checkTabOrder = (container: HTMLElement): number[] => {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
  );

  const tabIndexes: number[] = [];
  focusableElements.forEach(element => {
    const tabIndex = element.getAttribute('tabindex');
    tabIndexes.push(tabIndex ? parseInt(tabIndex) : 0);
  });

  return tabIndexes;
};
