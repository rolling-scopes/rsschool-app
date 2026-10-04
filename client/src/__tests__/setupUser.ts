import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type User = ReturnType<typeof userEvent.setup>;

export function setupUser(...options: Parameters<typeof userEvent.setup>): User {
  const user = userEvent.setup(...options);

  return new Proxy(user, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof value !== 'function') {
        return value;
      }

      return async (...args: unknown[]) => {
        let result: unknown;
        await act(async () => {
          result = await Reflect.apply(value, target, args);
        });
        return result;
      };
    },
  });
}
