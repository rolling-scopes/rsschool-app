import { User } from '@entities/user';
import { SystemUserDto } from './system-user.dto';

describe('SystemUserDto', () => {
  it('serializes createdDate as an ISO-8601 string (not a locale string)', () => {
    const dto = new SystemUserDto({
      id: 7,
      githubId: 'svc-bot',
      firstName: 'Service',
      lastName: 'Bot',
      createdDate: new Date('2026-07-20T10:11:12.000Z'),
    } as unknown as User);

    expect(dto.createdDate).toBe('2026-07-20T10:11:12.000Z');
    expect(dto.name).toBe('Service Bot');
    expect(dto.id).toBe(7);
    expect(dto.githubId).toBe('svc-bot');
  });

  it('normalizes a string date to ISO-8601', () => {
    const dto = new SystemUserDto({
      id: 1,
      githubId: 'x',
      firstName: '',
      lastName: '',
      createdDate: '2026-01-02T03:04:05.000Z',
    } as unknown as User);

    expect(dto.createdDate).toBe('2026-01-02T03:04:05.000Z');
    expect(dto.name).toBe('');
  });

  it('returns an empty string when createdDate is missing', () => {
    const dto = new SystemUserDto({
      id: 1,
      githubId: 'x',
      firstName: 'A',
      lastName: null,
      createdDate: undefined,
    } as unknown as User);

    expect(dto.createdDate).toBe('');
    expect(dto.name).toBe('A');
  });
});
