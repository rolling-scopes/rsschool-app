import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { DiscordService } from './discord.service';

// HttpService is consumed via lastValueFrom(this.httpService.post(...)), so the
// mock returns an rxjs observable. Mirrors the HttpService mock style used in
// src/auth/auth.service.spec.ts (provide/useValue) but with the post method stubbed.
const mockHttpService = {
  post: vi.fn(),
} as Partial<HttpService> as HttpService;

type GratitudeData = Parameters<DiscordService['sendGratitudeMessage']>[0];

const baseParams: GratitudeData = {
  fromGithubId: 'jane',
  toDiscordId: '123456789',
  toGithubId: 'john-doe',
  comment: 'Thanks for the great help!',
  gratitudeUrl: 'https://discord.com/api/webhooks/abc/def',
};

describe('DiscordService', () => {
  let service: DiscordService;
  let httpService: Mocked<HttpService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordService, { provide: HttpService, useValue: mockHttpService }],
    }).compile();

    service = module.get<DiscordService>(DiscordService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendGratitudeMessage (non-production environment)', () => {
    // NODE_ENV is undefined during tests, so isProd === false: messages are
    // logged and skipped, the HTTP call must never fire.
    it('skips the HTTP webhook call in development and returns undefined', async () => {
      const result = await service.sendGratitudeMessage(baseParams);

      expect(result).toBeUndefined();
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('logs the prepared message instead of sending it', async () => {
      const logSpy = vi.spyOn((service as unknown as { logger: { log: (m: string) => void } }).logger, 'log');

      await service.sendGratitudeMessage(baseParams);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const logged = logSpy.mock.calls[0]![0];
      expect(logged).toContain('Skip sending discord message in develoment');
      // The serialized message embeds the discord mention and comment.
      expect(logged).toContain('<@123456789>');
      expect(logged).toContain('Thanks for the great help!');
    });

    it('builds a discord mention when toDiscordId is provided', async () => {
      const logSpy = vi.spyOn((service as unknown as { logger: { log: (m: string) => void } }).logger, 'log');

      await service.sendGratitudeMessage({ ...baseParams, toDiscordId: '987' });

      const logged = logSpy.mock.calls[0]![0];
      expect(logged).toContain('<@987>');
      expect(logged).not.toContain('**@john-doe**');
    });

    it('falls back to a github mention when toDiscordId is null', async () => {
      const logSpy = vi.spyOn((service as unknown as { logger: { log: (m: string) => void } }).logger, 'log');

      await service.sendGratitudeMessage({ ...baseParams, toDiscordId: null });

      const logged = logSpy.mock.calls[0]![0];
      expect(logged).toContain('**@john-doe**');
      expect(logged).not.toContain('<@');
    });
  });

  // The prod branch depends on the module-level `isProd` constant, which is
  // evaluated from NODE_ENV at import time. Re-import the module with NODE_ENV
  // stubbed to 'production' so isProd === true and the HTTP path executes.
  describe('sendGratitudeMessage (production environment)', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.resetModules();
    });

    const loadProdService = async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.resetModules();
      // Dynamic re-import so the module-level isProd reads the stubbed NODE_ENV.
      // Path is built indirectly so NodeNext type resolution stays happy while
      // the vite/swc runtime resolves it normally.
      const modulePath = './discord.service';
      const mod: typeof import('./discord.service') = await import(modulePath);
      const prodModule: TestingModule = await Test.createTestingModule({
        providers: [mod.DiscordService, { provide: HttpService, useValue: mockHttpService }],
      }).compile();
      return prodModule.get(mod.DiscordService) as DiscordService;
    };

    it('posts the webhook payload with a discord mention to the gratitude URL', async () => {
      const prodService = await loadProdService();
      httpService.post.mockReturnValue(of({ data: 'ok' }) as never);

      await prodService.sendGratitudeMessage(baseParams);

      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith('https://discord.com/api/webhooks/abc/def', {
        avatar_url: 'https://github.com/jane.png',
        username: 'jane',
        content: '<@123456789>\nThanks for the great help!',
      });
    });

    it('posts a github mention when toDiscordId is null', async () => {
      const prodService = await loadProdService();
      httpService.post.mockReturnValue(of({ data: 'ok' }) as never);

      await prodService.sendGratitudeMessage({ ...baseParams, toDiscordId: null });

      expect(httpService.post).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/abc/def',
        expect.objectContaining({
          content: '**@john-doe**\nThanks for the great help!',
        }),
      );
    });

    it('awaits the observable and resolves when the webhook succeeds', async () => {
      const prodService = await loadProdService();
      httpService.post.mockReturnValue(of({ data: 'ok' }) as never);

      await expect(prodService.sendGratitudeMessage(baseParams)).resolves.toBeUndefined();
    });

    it('propagates the error when the webhook call fails', async () => {
      const prodService = await loadProdService();
      const error = new Error('discord 500');
      httpService.post.mockImplementation(() => {
        throw error;
      });

      await expect(prodService.sendGratitudeMessage(baseParams)).rejects.toThrow('discord 500');
    });
  });
});
