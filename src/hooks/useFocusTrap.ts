import { useEffect, useRef } from 'react';

/**
 * A custom hook to trap focus within a DOM element and handle accessibility (WCAG 2.1) features
 * such as focus trapping, Escape key listener, and restoring focus to the original active element.
 */
export function useFocusTrap(isOpen: boolean, onClose: () => void) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Record currently focused element to restore focus when modal closes
      previousFocusRef.current = document.activeElement as HTMLElement;

      const container = containerRef.current;
      if (container) {
        // Set container tabindex to make it focusable if needed
        if (!container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1');
        }

        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
        
        // Let's delay focus slightly to ensure transition/animation completes
        const focusTimeout = setTimeout(() => {
          if (focusableElements.length > 0) {
            // Focus the close button, confirm button, or first input
            const firstInputOrButton = Array.from(focusableElements).find(
              el => el.tagName === 'INPUT' || el.tagName === 'BUTTON'
            );
            if (firstInputOrButton) {
              firstInputOrButton.focus();
            } else {
              focusableElements[0].focus();
            }
          } else {
            container.focus();
          }
        }, 60);

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
            return;
          }

          if (e.key === 'Tab') {
            const currentFocusables = container.querySelectorAll<HTMLElement>(focusableSelector);
            if (currentFocusables.length === 0) return;

            const firstElement = currentFocusables[0];
            const lastElement = currentFocusables[currentFocusables.length - 1];

            if (e.shiftKey) {
              // Shift + Tab: Wrap from first element to last
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              // Tab: Wrap from last element to first
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
          clearTimeout(focusTimeout);
          window.removeEventListener('keydown', handleKeyDown);
          
          // Safely restore focus to previous element
          if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
            previousFocusRef.current.focus();
          }
        };
      }
    }
  }, [isOpen, onClose]);

  return containerRef;
}
