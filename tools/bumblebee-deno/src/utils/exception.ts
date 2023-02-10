export class Exception extends Error {
  // deno-lint-ignore no-explicit-any
  constructor(component: string, message = 'Internal Server Error', code = 500, details?: any) {
    const detailsString = details ? `\n\n${JSON.stringify(details, null, 2)}` : '';

    super(`[${component}]: ${code}: ${message}${detailsString}`);
  }
}
