import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from 'src/config';
import { CloudApiService } from '../cloud-api/cloud-api.service';
import { FilesController } from './files.controller';

// Fixtures mirrored from server/src/routes/file/__test__/upload.test.ts to prove business-logic equivalence
const mockBody = { cells: [{ source: 'print(1)' }] };
const mockAwsResponse = { s3Key: 'notebooks/john-doe/task.ipynb' };

const mockPost = vi.fn();

describe('files upload', () => {
  let controller: FilesController;

  beforeEach(async () => {
    mockPost.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        CloudApiService,
        { provide: HttpService, useValue: { post: mockPost } },
        {
          provide: ConfigService,
          useValue: { awsServices: { restApiUrl: 'https://aws.example.com', restApiKey: 'secret-key' } },
        },
      ],
    }).compile();

    controller = module.get(FilesController);
  });

  it('posts the payload to the AWS gateway upload endpoint with api key and passes response through', async () => {
    mockPost.mockReturnValue(of({ data: mockAwsResponse }));
    const req = { user: { githubId: 'john-doe' } } as never;

    const result = await controller.uploadFile(req, mockBody, 'task.ipynb');

    expect(mockPost).toHaveBeenCalledWith('https://aws.example.com/upload?key=task.ipynb&githubId=john-doe', mockBody, {
      headers: { 'x-api-key': 'secret-key' },
    });
    expect(result).toBe(mockAwsResponse);
  });

  it('defaults key to empty string when not provided', async () => {
    mockPost.mockReturnValue(of({ data: mockAwsResponse }));
    const req = { user: { githubId: 'john-doe' } } as never;

    await controller.uploadFile(req, mockBody, undefined as unknown as string);

    expect(mockPost).toHaveBeenCalledWith(
      'https://aws.example.com/upload?key=&githubId=john-doe',
      mockBody,
      expect.anything(),
    );
  });
});
