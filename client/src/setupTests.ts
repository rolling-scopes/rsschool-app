import '@testing-library/jest-dom/vitest';
import matchMediaPolyfill from 'mq-polyfill';

matchMediaPolyfill(window);

// antd v6 @rc-component/util calls getComputedStyle with pseudoElt argument.
// jsdom does not support the second argument and throws "Not implemented".
// Provide a stub that returns an empty CSSStyleDeclaration-like object.
const origGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
  if (pseudoElt) {
    return {} as CSSStyleDeclaration;
  }
  return origGetComputedStyle(elt);
};

// antd v6 uses CSS.supports for feature detection and animations.
// jsdom does not include CSS.supports, so we provide a no-op stub.
if (typeof globalThis.CSS === 'undefined') {
  // @ts-expect-error partial polyfill for jsdom
  globalThis.CSS = { supports: () => false };
} else if (typeof globalThis.CSS.supports !== 'function') {
  globalThis.CSS.supports = () => false;
}

// antd v6 uses ResizeObserver internally via @rc-component/resize-observer.
// jsdom does not include ResizeObserver, so we provide a mock on global.
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// @rc-component/motion (used by antd v6 for animations) detects CSS animation support by
// checking if webkit animation properties exist in document.createElement('div').style.
// In jsdom these properties exist but animation events never fire, so animated elements
// (modals, drawers, etc.) remain in the DOM indefinitely after close.
// Deleting these properties from CSSStyleDeclaration prototype makes supportTransition=false,
// which causes @rc-component/motion to skip animations and unmount elements immediately.
const _testDiv = document.createElement('div');
const _CSSStyleDeclarationProto = Object.getPrototypeOf(_testDiv.style) as Record<string, unknown>;
['webkitAnimation', 'WebkitAnimation'].forEach(prop => {
  if (Object.prototype.hasOwnProperty.call(_CSSStyleDeclarationProto, prop)) {
    try {
      delete _CSSStyleDeclarationProto[prop];
    } catch {
      console.log(`Failed to delete CSSStyleDeclaration property: ${prop}`);
    }
  }
});

// antd v6 uses MessageChannel via @rc-component/form for batching form updates.
// jsdom does not include MessageChannel, so we provide a working mock implementation on global.
if (typeof global.MessageChannel === 'undefined') {
  class MockMessagePort {
    onmessage: ((event: { data: unknown }) => void) | null = null;
    private _partner: MockMessagePort | null = null;
    _link(partner: MockMessagePort) {
      this._partner = partner;
    }
    postMessage(data: unknown) {
      const partner = this._partner;
      if (partner?.onmessage) {
        setTimeout(() => partner.onmessage?.({ data }), 0);
      }
    }
    start() {}
    close() {}
  }
  class MockMessageChannel {
    port1: MockMessagePort;
    port2: MockMessagePort;
    constructor() {
      this.port1 = new MockMessagePort();
      this.port2 = new MockMessagePort();
      this.port1._link(this.port2);
      this.port2._link(this.port1);
    }
  }
  // @ts-expect-error polyfill for jsdom
  global.MessageChannel = MockMessageChannel;
}
