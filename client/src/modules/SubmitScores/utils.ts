export interface SubmitResult {
  status: string;
  count: number;
  messages?: string[];
}

interface RawResult {
  status: string;
  value: string | number;
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
          status === 'skipped' && typeof value === 'string'
            ? (current.messages ?? []).concat(value)
            : current.messages,
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
