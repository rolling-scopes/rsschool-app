#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { RsappApiClient } from './api-client.js';
import { ISSUE_CERTIFICATE_TOOL, issueCertificateInputSchema, runIssueCertificate } from './tools/issue-certificate.js';
import {
  ISSUE_CERTIFICATES_BULK_TOOL,
  issueCertificatesBulkInputSchema,
  runIssueCertificatesBulk,
} from './tools/issue-certificates-bulk.js';
import { LIST_COURSE_TASKS_TOOL, listCourseTasksInputSchema, runListCourseTasks } from './tools/list-course-tasks.js';
import { LIST_MY_COURSES_TOOL, listMyCoursesInputSchema, runListMyCourses } from './tools/list-my-courses.js';
import {
  PREVIEW_ELIGIBLE_STUDENTS_TOOL,
  previewEligibleStudentsInputSchema,
  runPreviewEligibleStudents,
} from './tools/preview-eligible-students.js';
import { SEARCH_USERS_TOOL, searchUsersInputSchema, runSearchUsers } from './tools/search-users.js';
import { z } from 'zod';

function readConfig() {
  const baseUrl = process.env.RSAPP_BASE_URL;
  const token = process.env.RSAPP_PAT;
  if (!baseUrl) {
    throw new Error('RSAPP_BASE_URL env variable is required');
  }
  if (!token) {
    throw new Error('RSAPP_PAT env variable is required');
  }
  if (!token.startsWith('rsapp_pat_')) {
    throw new Error('RSAPP_PAT must start with "rsapp_pat_"');
  }
  return { baseUrl, token };
}

type ToolBinding = {
  tool: { name: string; description: string; inputSchema: unknown };
  schema: z.ZodTypeAny;
  run: (client: RsappApiClient, input: never) => Promise<string>;
};

const TOOLS: ToolBinding[] = [
  { tool: ISSUE_CERTIFICATE_TOOL, schema: issueCertificateInputSchema, run: runIssueCertificate as never },
  {
    tool: ISSUE_CERTIFICATES_BULK_TOOL,
    schema: issueCertificatesBulkInputSchema,
    run: runIssueCertificatesBulk as never,
  },
  { tool: LIST_MY_COURSES_TOOL, schema: listMyCoursesInputSchema, run: runListMyCourses as never },
  { tool: LIST_COURSE_TASKS_TOOL, schema: listCourseTasksInputSchema, run: runListCourseTasks as never },
  {
    tool: PREVIEW_ELIGIBLE_STUDENTS_TOOL,
    schema: previewEligibleStudentsInputSchema,
    run: runPreviewEligibleStudents as never,
  },
  { tool: SEARCH_USERS_TOOL, schema: searchUsersInputSchema, run: runSearchUsers as never },
];

async function main() {
  const config = readConfig();
  const client = new RsappApiClient(config);

  const server = new Server({ name: 'rsschool', version: '0.1.0' }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map(b => b.tool),
  }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const binding = TOOLS.find(b => b.tool.name === request.params.name);
    if (!binding) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }],
      };
    }
    const parsed = binding.schema.safeParse(request.params.arguments);
    if (!parsed.success) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Invalid input: ${parsed.error.message}` }],
      };
    }
    const text = await binding.run(client, parsed.data as never);
    return { content: [{ type: 'text', text }] };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
