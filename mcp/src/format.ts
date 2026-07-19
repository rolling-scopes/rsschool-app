/**
 * Renders API data as a JSON block for the agent, truncating oversized
 * payloads so a single tool call cannot flood the model context.
 */
export function toJsonBlock(data: unknown, maxChars = 8000): string {
  const json = JSON.stringify(data, null, 2) ?? 'null';
  if (json.length <= maxChars) {
    return json;
  }
  return `${json.slice(0, maxChars)}\n… (truncated, ${json.length - maxChars} more characters; narrow the request to see the rest)`;
}
