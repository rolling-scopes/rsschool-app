import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { NoConsentView } from './index';

// Brittle-widget stub: antd Tooltip's `getPopupContainer` positioning callback is never
// invoked in jsdom (the popup portal does not mount on hover). Replace Tooltip with a stub
// that DOES call `getPopupContainer` with controlled trigger nodes so both sides of
// `triggerNode.parentElement || document.body` are exercised.
const { capturedContainers } = vi.hoisted(() => ({ capturedContainers: [] as unknown[] }));

vi.mock('antd', async () => {
  const actual = (await vi.importActual('antd')) as typeof import('antd');
  const Tooltip = ({
    children,
    getPopupContainer,
  }: {
    children: ReactNode;
    getPopupContainer?: (node: HTMLElement) => HTMLElement;
  }) => {
    if (getPopupContainer) {
      // 1) A node WITH a parentElement → the `triggerNode.parentElement` branch.
      const withParent = document.createElement('span');
      document.createElement('div').appendChild(withParent);
      capturedContainers.push(getPopupContainer(withParent));

      // 2) A detached node (no parentElement) → the `|| document.body` fallback.
      const detached = document.createElement('span');
      capturedContainers.push(getPopupContainer(detached));
    }
    return <>{children}</>;
  };
  return { ...actual, Tooltip };
});

describe('NoConsentView tooltip popup container', () => {
  it('resolves the tooltip popup container to the trigger parent or document.body', async () => {
    render(<NoConsentView isOwner giveConsent={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'plus Create CV' }));

    // Opening the modal renders the list with the header + 4 item tooltips → getPopupContainer
    // is called twice per tooltip (parent node and detached node).
    expect(capturedContainers.length).toBeGreaterThanOrEqual(2);
    // First call (node with parent) resolved to the parent element, not the body fallback.
    expect(capturedContainers[0]).not.toBe(document.body);
    // Second call (detached node) fell back to document.body.
    expect(capturedContainers[1]).toBe(document.body);
  });
});
