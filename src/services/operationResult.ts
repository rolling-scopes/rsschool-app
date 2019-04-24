export interface OperationResult {
  status: 'created' | 'updated' | 'deleted' | 'skipped';
  value: any;
}
