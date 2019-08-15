export = index;
declare class index {
  static SpreadsheetCell(spreadsheet: any, ss_key: any, worksheet_id: any, data: any): any;
  constructor(ss_key: any, auth_id?: any, options?: any);
  setAuthToken: any;
  setAuth: any;
  useServiceAccountAuth: any;
  isAuthActive: any;
  makeFeedRequest: any;
  getInfo: any;
  addWorksheet: any;
  removeWorksheet: any;
  getRows: any;
  addRow: any;
  getCells: any;
}
