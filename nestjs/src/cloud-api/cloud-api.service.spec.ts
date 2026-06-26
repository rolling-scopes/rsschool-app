import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigService } from 'src/config';
import { CloudApiService } from './cloud-api.service';

describe('CloudApiService', () => {
  let service: CloudApiService;
  const mockPost = vi.fn();

  const baseUrl = 'https://aws.example.com';
  const apiKey = 'secret-key';
  const headers = { headers: { 'x-api-key': apiKey } };

  beforeEach(async () => {
    mockPost.mockReset().mockReturnValue(of({ data: { ok: true } }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudApiService,
        { provide: HttpService, useValue: { post: mockPost } },
        {
          provide: ConfigService,
          useValue: { awsServices: { restApiUrl: baseUrl, restApiKey: apiKey } },
        },
      ],
    }).compile();

    service = module.get(CloudApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logErrors', () => {
    it('posts errors to the /errors endpoint with the api key header', async () => {
      const errors = [{ message: 'boom' }];
      const response = { data: { logged: true } };
      mockPost.mockReturnValueOnce(of(response));

      const result = await service.logErrors(errors);

      expect(mockPost).toHaveBeenCalledWith(`${baseUrl}/errors`, errors, headers);
      expect(result).toBe(response);
    });
  });

  describe('submitTask', () => {
    it('posts task data to the /task endpoint with the api key header', async () => {
      const data = [{ id: 1 }];
      const response = { data: { submitted: true } };
      mockPost.mockReturnValueOnce(of(response));

      const result = await service.submitTask(data);

      expect(mockPost).toHaveBeenCalledWith(`${baseUrl}/task`, data, headers);
      expect(result).toBe(response);
    });
  });

  describe('uploadFile', () => {
    it('posts to the upload endpoint with key/githubId query params and returns response data', async () => {
      const payload = { content: 'binary' };
      mockPost.mockReturnValueOnce(of({ data: { url: 'https://cdn/file' } }));

      const result = await service.uploadFile('john', 'avatar.png', payload);

      expect(mockPost).toHaveBeenCalledWith(`${baseUrl}/upload?key=avatar.png&githubId=john`, payload, headers);
      expect(result).toEqual({ url: 'https://cdn/file' });
    });
  });
});
