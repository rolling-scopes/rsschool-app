import { describe, expect, it } from 'vitest';
import { TOOLS } from './registry.js';
import { makeCtx } from './test-utils.js';
import { isToolFailure, type ToolBinding } from './types.js';

/**
 * Contract tests that hold for EVERY tool, so a new tool can't quietly break
 * the invariants the protocol layer relies on. Inputs are synthesized from each
 * tool's advertised JSON Schema — if the synthesizer can't satisfy a schema the
 * test fails rather than silently skipping the tool.
 */

type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  format?: string;
  minimum?: number;
  minItems?: number;
};

function synthesize(schema: JsonSchema): unknown {
  if (schema.enum?.length) {
    return schema.enum[0];
  }
  switch (schema.type) {
    case 'integer':
    case 'number':
      return schema.minimum ?? 1;
    case 'boolean':
      return false;
    case 'array': {
      const count = schema.minItems ?? 0;
      const item = schema.items ?? { type: 'string' };
      return Array.from({ length: count }, () => synthesize(item));
    }
    case 'object':
      return synthesizeObject(schema);
    default:
      return schema.format === 'uri' ? 'https://example.dev/x' : 'x';
  }
}

function synthesizeObject(schema: JsonSchema): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of schema.required ?? []) {
    const property = schema.properties?.[key];
    out[key] = property ? synthesize(property) : 'x';
  }
  return out;
}

function minimalInput(binding: ToolBinding): unknown {
  return synthesizeObject(binding.tool.inputSchema as JsonSchema);
}

describe('tool contract: input schemas', () => {
  it('every advertised schema produces input its zod schema accepts', () => {
    const rejected = TOOLS.filter(binding => !binding.schema.safeParse(minimalInput(binding)).success).map(
      binding => binding.tool.name,
    );
    expect(rejected).toEqual([]);
  });
});

describe('tool contract: failures are reported as failures', () => {
  // Every tool, given a backend that denies everything, must return a
  // ToolFailure — otherwise the model sees a 403 as if it were data.
  it.each(TOOLS.map(binding => [binding.tool.name, binding] as const))(
    '%s reports a denied backend',
    async (_, binding) => {
      const denied = () => ({ ok: false as const, status: 403, message: 'denied' });
      const { ctx } = makeCtx({ get: denied, post: denied, put: denied, delete: denied });
      const result = await binding.run(ctx, minimalInput(binding) as never);
      expect(isToolFailure(result)).toBe(true);
    },
  );

  it.each(TOOLS.map(binding => [binding.tool.name, binding] as const))(
    '%s reports a backend timeout',
    async (_, binding) => {
      const timedOut = () => ({ ok: false as const, status: -1, message: 'No response within 15000ms' });
      const { ctx } = makeCtx({ get: timedOut, post: timedOut, put: timedOut, delete: timedOut });
      const result = await binding.run(ctx, minimalInput(binding) as never);
      expect(isToolFailure(result)).toBe(true);
    },
  );
});
