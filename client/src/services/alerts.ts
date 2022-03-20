import { AlertsApi } from 'api';

export class AlertsService {
  private alertService = new AlertsApi();

  async getAll() {
    const result = await this.alertService.getAlerts(true);
    return result.data;
  }
}
