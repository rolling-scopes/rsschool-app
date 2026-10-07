/**
 * Server identity, reported over MCP (`initialize`) and to the RS School API
 * (`User-Agent`). Keep in sync with the `version` field in package.json —
 * importing package.json would drag JSON module assertions into the build.
 */
export const SERVER_NAME = 'rsschool-mcp';
export const SERVER_VERSION = '0.2.0';
