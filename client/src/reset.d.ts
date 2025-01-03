import '@total-typescript/ts-reset';

declare global {
  interface URLSearchParams {
    append(name: string, value: string | unknown): void;
  }
}
