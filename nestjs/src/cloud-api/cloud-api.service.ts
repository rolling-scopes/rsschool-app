import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from 'src/config';

@Injectable()
export class CloudApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    readonly configService: ConfigService,
  ) {
    this.baseUrl = configService.awsServices.restApiUrl;
    this.apiKey = configService.awsServices.restApiKey;
  }

  public async logErrors<T>(errors: T[]) {
    return lastValueFrom(this.httpService.post(`${this.baseUrl}/errors`, errors, this.getHeaders()));
  }

  public async submitTask<T>(data: T[]) {
    return lastValueFrom(this.httpService.post(`${this.baseUrl}/task`, data, this.getHeaders()));
  }

  public async uploadFile(githubId: string, key: string, data: unknown) {
    const response = await lastValueFrom(
      this.httpService.post(`${this.baseUrl}/upload?key=${key}&githubId=${githubId}`, data, this.getHeaders()),
    );
    return response.data;
  }

  private getHeaders() {
    return { headers: { 'x-api-key': this.apiKey } };
  }
}
