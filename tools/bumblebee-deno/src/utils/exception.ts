export class Exception extends Error {
  code: number;

  constructor(component: string, message = 'Internal Server Error', code = 500) {
    super(`[${component}] ${message}`);
    this.code = code;
  }
}

// TODO: Do we need it?
// export const handleError = async (fn: () => Promise<void>) => {
//   try {
//     await fn();
//   } catch(error) {
//     console.error('ERROR', error, error.message, error.stack);
//     throw error;
//   }
// }
