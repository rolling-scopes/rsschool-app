export class Exception extends Error {
  code: number;

  constructor(component: string, message = 'Internal Server Error', code = 500) {
    super(`[${component}] ${message}`);
    this.code = code;
  }
}
