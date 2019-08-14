import QueryParameters from './QueryParameters';

export default interface Service {
  name: string;
  link: string;
  method: string;
  queryParameters: QueryParameters;
  xlsxField?: string;
  userParameter?: string;
  taskParameter?: string;
  tasks?: string[];
  scoreMapping?: any;
}
