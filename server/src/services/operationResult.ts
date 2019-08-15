export interface OperationResult {
  status: 'created' | 'updated' | 'deleted' | 'skipped' | 'failed';
  value: any;
}
