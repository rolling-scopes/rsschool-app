import '@testing-library/jest-dom';
import matchMediaPolyfill from 'mq-polyfill';

matchMediaPolyfill(window);

// antd v6 uses ResizeObserver internally via @rc-component/resize-observer.
// jsdom does not include ResizeObserver, so we provide a mock on global.
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

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
