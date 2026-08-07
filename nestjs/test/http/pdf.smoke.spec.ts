import { Readable } from 'stream';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CertificatesController } from 'src/certificates/certificates.controller';
import { CertificationsService } from 'src/certificates/certificates.service';
import { StudentsService } from 'src/courses/students';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ADAPTERS, binaryParser, createHttpApp } from './harness';

const pdfBytes = Buffer.from('%PDF-1.4 smoke-test-bytes');
const metadata = { publicId: 'abc', courseName: 'Test Course' };

describe.each(ADAPTERS)('certificate PDF/JSON over HTTP [%s]', adapter => {
  let app: INestApplication;
  const getByPublicId = vi.fn();
  const getFileStream = vi.fn();
  const getCertificateMetadata = vi.fn();

  beforeAll(async () => {
    app = await createHttpApp(
      {
        controllers: [CertificatesController],
        providers: [
          {
            provide: CertificationsService,
            useValue: { getByPublicId, getFileStream, getCertificateMetadata },
          },
          { provide: UserNotificationsService, useValue: {} },
          { provide: StudentsService, useValue: {} },
        ],
      },
      adapter,
    );
  });

  beforeEach(() => {
    getByPublicId.mockResolvedValue({ s3Bucket: 'test-bucket', s3Key: 'test-key' });
    getFileStream.mockImplementation(async () => Readable.from([pdfBytes]));
    getCertificateMetadata.mockResolvedValue(metadata);
  });

  afterAll(async () => {
    await app.close();
  });

  it('streams the pdf with the exact content type', async () => {
    const response = await request(app.getHttpServer())
      .get('/certificate/abc')
      .buffer(true)
      .parse(binaryParser)
      .expect(200);

    expect(response.headers['content-type']).toBe('application/pdf');
    expect(Buffer.compare(response.body as Buffer, pdfBytes)).toBe(0);
    expect(getByPublicId).toHaveBeenCalledWith('abc');
  });

  it('serves certificate metadata as json for the .json variant', async () => {
    const response = await request(app.getHttpServer()).get('/certificate/abc.json').expect(200);

    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual(metadata);
    expect(getByPublicId).toHaveBeenCalledWith('abc');
  });

  it('returns a 404 json body for an unknown certificate', async () => {
    getByPublicId.mockResolvedValue(null);

    const response = await request(app.getHttpServer()).get('/certificate/nope').expect(404);

    expect(response.body).toEqual({ statusCode: 404, message: 'Not Found' });
  });
});
