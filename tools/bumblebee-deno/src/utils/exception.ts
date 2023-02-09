export class Exception extends Error {
  code: number;

  constructor(component: string, message = 'Internal Server Error', code = 500) {
    super(`[${component}] ${message}`);
    this.code = code;
  }
}

export const handleAsyncError = async (fn: () => Promise<void>) => {
  try {
    await fn();
  } catch(error) {
    console.log('error', error);
  }
}

export const handleError = (fn: () => void) => {
  try {
    fn();
  } catch(error) {
    console.log('error', error);
  }
}
