export class CustomError extends Error {
  statusCode: number;

  customCode: string;

  constructor(statusCode: number, customCode: string, message: string) {
    super();
    this.statusCode = statusCode;
    this.customCode = customCode;
    this.message = message;
  }
}

export default CustomError;
