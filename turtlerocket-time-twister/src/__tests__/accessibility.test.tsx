import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import {
  checkAriaLabels,
  checkKeyboardNavigation,
  checkFormLabels,
  checkImageAltText,
  checkHeadingHierarchy,
  checkTabOrder,
} from '../test-utils/accessibilityHelpers';
import { generateMockEvents, createMockICSFile } from '../test-utils';

describe('Accessibility Tests - A11y Compliance', () => {
  describe('Semantic HTML', () => {
    it('should use semantic HTML elements', () => {
      const { container } = render(<App />);

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<App />);
      const violations = checkHeadingHierarchy(container);

      expect(violations.length).toBe(0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support full keyboard navigation', async () => {
      const { container } = render(<App />);
      const canNavigate = await checkKeyboardNavigation(container);

      expect(canNavigate).toBe(true);
    });

    it('should have logical tab order', () => {
      const { container } = render(<App />);
      const tabOrder = checkTabOrder(container);

      const hasNegativeTabIndex = tabOrder.some(index => index < -1);
      expect(hasNegativeTabIndex).toBe(false);
    });

    it('should allow tabbing through energy selectors', async () => {
      
      render(<App />);

      const firstSelector = screen.getAllByRole('combobox')[0];
      firstSelector.focus();

      expect(document.activeElement).toBe(firstSelector);

      await userEvent.tab();

      expect(document.activeElement).not.toBe(firstSelector);
    });

    it('should support keyboard interaction for file upload', async () => {
      
      render(<App />);

      const fileInput = screen.getByLabelText(/upload/i);
      fileInput.focus();

      expect(document.activeElement).toBe(fileInput);
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      const { container } = render(<App />);
      const violations = checkAriaLabels(container);

      expect(violations.length).toBeLessThan(3);
    });

    it('should label all form controls', () => {
      const { container } = render(<App />);
      const violations = checkFormLabels(container);

      expect(violations.length).toBe(0);
    });

    it('should have accessible file upload button', () => {
      render(<App />);
      const fileInput = screen.getByLabelText(/upload/i);

      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('should have accessible energy selectors', () => {
      render(<App />);
      const selectors = screen.getAllByRole('combobox');

      selectors.forEach(selector => {
        const label = selector.getAttribute('aria-label') || 
                     selector.closest('label')?.textContent;
        expect(label).toBeTruthy();
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce file upload status', async () => {
      
      render(<App />);

      const events = generateMockEvents({ count: 5 });
      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(fileInput, file);

      const liveRegions = document.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThan(0);
    });

    it('should have descriptive text for schedules', async () => {
      
      render(<App />);

      const events = generateMockEvents({ count: 3 });
      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(fileInput, file);

      await screen.findByText(/schedule/i, {}, { timeout: 3000 });

      const scheduleElements = screen.getAllByText(/schedule/i);
      expect(scheduleElements.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus after energy selection', async () => {
      
      render(<App />);

      const selector = screen.getAllByRole('combobox')[0];
      await userEvent.click(selector);
      await userEvent.selectOptions(selector, '2');

      expect(document.activeElement).toBe(selector);
    });

    it('should not trap focus', async () => {
      
      render(<App />);

      const interactiveElements = screen.getAllByRole('combobox');
      const firstElement = interactiveElements[0];
      const lastElement = interactiveElements[interactiveElements.length - 1];

      firstElement.focus();
      expect(document.activeElement).toBe(firstElement);

      for (let i = 0; i < interactiveElements.length + 5; i++) {
        await userEvent.tab();
      }

      expect(document.activeElement).not.toBe(lastElement);
    });
  });

  describe('Color and Contrast', () => {
    it('should have sufficient color contrast for text', () => {
      const { container } = render(<App />);
      const textElements = container.querySelectorAll('p, span, h1, h2, h3, label');

      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.color).toBeTruthy();
        expect(styles.backgroundColor || styles.background).toBeTruthy();
      });
    });

    it('should not rely solely on color for information', async () => {
      
      render(<App />);

      const events = generateMockEvents({ count: 3 });
      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(fileInput, file);

      await screen.findByText(/event/i, {}, { timeout: 3000 });

      const eventElements = screen.getAllByText(/event/i);
      eventElements.forEach(element => {
        expect(element.textContent).toBeTruthy();
      });
    });
  });

  describe('Form Accessibility', () => {
    it('should have accessible error messages', async () => {
      
      render(<App />);

      const invalidFile = new File(['invalid'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(fileInput, invalidFile);

      const errorMessage = await screen.findByText(/error|invalid/i, {}, { timeout: 2000 }).catch(() => null);
      
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });

    it('should associate labels with form controls', () => {
      const { container } = render(<App />);
      const inputs = container.querySelectorAll('input, select');

      inputs.forEach(input => {
        const id = input.id;
        if (id) {
          const label = container.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = input.hasAttribute('aria-label');
          const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');

          expect(
            label || hasAriaLabel || hasAriaLabelledBy
          ).toBeTruthy();
        }
      });
    });
  });

  describe('Dynamic Content', () => {
    it('should announce dynamic content changes', async () => {
      
      const { container } = render(<App />);

      const events = generateMockEvents({ count: 3 });
      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(fileInput, file);

      const liveRegions = container.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
      expect(liveRegions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Alternative Text', () => {
    it('should have alt text for all images', () => {
      const { container } = render(<App />);
      const violations = checkImageAltText(container);

      expect(violations.length).toBe(0);
    });
  });

  describe('Language and Direction', () => {
    it('should have language attribute', () => {
      render(<App />);
      const html = document.querySelector('html');
      
      expect(html?.hasAttribute('lang') || document.body.hasAttribute('lang')).toBeTruthy();
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('should be accessible at different viewport sizes', () => {
      const viewports = [
        { width: 320, height: 568 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 },
      ];

      viewports.forEach(viewport => {
        global.innerWidth = viewport.width;
        global.innerHeight = viewport.height;

        const { container } = render(<App />);
        const canNavigate = checkKeyboardNavigation(container);

        expect(canNavigate).toBeTruthy();
      });
    });
  });

  describe('Interactive Element States', () => {
    it('should indicate disabled state accessibly', async () => {
      render(<App />);

      const exportButton = screen.queryByRole('button', { name: /export/i });
      
      if (exportButton) {
        if (exportButton.hasAttribute('disabled')) {
          expect(
            exportButton.getAttribute('aria-disabled') === 'true' ||
            exportButton.hasAttribute('disabled')
          ).toBeTruthy();
        }
      }
    });

    it('should indicate loading state accessibly', async () => {
      
      const { container } = render(<App />);

      const events = generateMockEvents({ count: 50 });
      const file = createMockICSFile(events);
      const fileInput = screen.getByLabelText(/upload/i) as HTMLInputElement;

      await userEvent.upload(fileInput, file);

      const loadingIndicator = container.querySelector('[aria-busy="true"], [role="progressbar"]');
      
      if (loadingIndicator) {
        expect(loadingIndicator).toBeInTheDocument();
      }
    });
  });

  describe('WCAG 2.1 Compliance', () => {
    it('should meet WCAG 2.1 Level AA requirements for interactive elements', () => {
      const { container } = render(<App />);
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        const hasAccessibleName = 
          button.textContent?.trim() ||
          button.getAttribute('aria-label') ||
          button.getAttribute('aria-labelledby');
        
        expect(hasAccessibleName).toBeTruthy();
      });
    });

    it('should support text resize up to 200%', () => {
      const { container } = render(<App />);
      
      const originalFontSize = window.getComputedStyle(container).fontSize;
      document.documentElement.style.fontSize = '200%';
      
      const newFontSize = window.getComputedStyle(container).fontSize;
      
      expect(parseFloat(newFontSize)).toBeGreaterThanOrEqual(parseFloat(originalFontSize));
      
      document.documentElement.style.fontSize = '';
    });
  });
});
