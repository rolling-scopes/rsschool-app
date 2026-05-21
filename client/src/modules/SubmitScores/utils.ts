export interface SubmitResult {
  status: string;
  count: number;
  messages?: string[];
}

export interface RawResult {
  status: string;
  // Backend (createMultipleScores.ts) returns `value: undefined` for `created`/`updated`
  // and `value: <message>` for `skipped`/`failed`.
  value?: string | number;
}

export interface ManualRow {
  studentGithubId: string;
  courseTaskId: number;
  score: number;
}

/**
 * Aggregates raw per-student results returned by `POST /course/:id/scores/:taskId`
 * into a summary grouped by status (`created`, `updated`, `skipped`, `failed`).
 *
 * Shared between CSV upload and manual submit flows.
 */
export function aggregateResults(results: RawResult[]): SubmitResult[] {
  const groupedByStatus = new Map<string, SubmitResult>();

  results.forEach(({ status, value }) => {
    const current = groupedByStatus.get(status);

    if (current) {
      groupedByStatus.set(status, {
        status,
        count: current.count + 1,
        messages:
          status === 'skipped' && typeof value === 'string' ? (current.messages ?? []).concat(value) : current.messages,
      });
    } else {
      groupedByStatus.set(status, {
        status,
        count: 1,
        messages: status === 'skipped' && typeof value === 'string' ? [value] : undefined,
      });
    }
  });

  return Array.from(groupedByStatus.values());
}

/**
 * Returns the first row that duplicates a previous one by (courseTaskId, studentGithubId),
 * case-insensitive on githubId. Returns null when no duplicates are found.
 *
 * Used by the manual submit flow to surface a meaningful error before sending the batch.
 */
export function findDuplicateRow(rows: ManualRow[]): ManualRow | null {
  const seen = new Set<string>();
  for (const r of rows) {
    const key = `${r.courseTaskId}::${r.studentGithubId.toLowerCase()}`;
    if (seen.has(key)) return r;
    seen.add(key);
  }
  return null;
}
