import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from '@entities/user';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController admin endpoints', () => {
  const mockUpsertUsers = vi.fn();
  const mockSetActivist = vi.fn();
  let controller: UsersController;

  beforeEach(async () => {
    mockUpsertUsers.mockReset();
    mockSetActivist.mockReset();

    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: { upsertUsers: mockUpsertUsers, setActivist: mockSetActivist },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('createUsers delegates the payload to the service and returns its result', async () => {
    const payload = [{ githubId: 'Alpha' }, { githubId: 'beta' }];
    const expected = [
      { status: 'created', value: 'GithubId: Alpha, UserId: 1' },
      { status: 'updated', value: 'GithubId: beta, UserId: 2' },
    ];
    mockUpsertUsers.mockResolvedValue(expected);

    const result = await controller.createUsers(payload);

    expect(mockUpsertUsers).toHaveBeenCalledWith(payload);
    expect(result).toEqual(expected);
  });

  it('updateUserActivist sets the flag when the user exists', async () => {
    mockSetActivist.mockResolvedValue(true);

    await expect(controller.updateUserActivist(42, { activist: true })).resolves.toBeUndefined();
    expect(mockSetActivist).toHaveBeenCalledWith(42, true);
  });

  it('updateUserActivist responds 400 when the user is absent', async () => {
    mockSetActivist.mockResolvedValue(false);

    await expect(controller.updateUserActivist(42, { activist: false })).rejects.toThrow(BadRequestException);
  });
});

describe('UsersService admin operations', () => {
  const mockFindOne = vi.fn();
  const mockSave = vi.fn();
  const mockUpdate = vi.fn();
  let service: UsersService;

  beforeEach(async () => {
    mockFindOne.mockReset();
    mockSave.mockReset();
    mockUpdate.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: { findOne: mockFindOne, save: mockSave, update: mockUpdate } },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('upsertUsers', () => {
    it('creates a user when none exists (lowercased githubId lookup)', async () => {
      mockFindOne.mockResolvedValue(null);
      mockSave.mockResolvedValue({ id: 7 });

      const result = await service.upsertUsers([{ githubId: 'NewGuy' }]);

      expect(mockFindOne).toHaveBeenCalledWith({ where: { githubId: 'newguy' } });
      expect(mockSave).toHaveBeenCalledWith({ githubId: 'NewGuy' });
      expect(result).toEqual([{ status: 'created', value: 'GithubId: NewGuy, UserId: 7' }]);
    });

    it('updates an existing user by merging fields', async () => {
      mockFindOne.mockResolvedValue({ id: 3, githubId: 'existing', firstName: 'Old' });
      mockSave.mockResolvedValue({ id: 3 });

      const result = await service.upsertUsers([{ githubId: 'existing', firstName: 'New' }]);

      expect(mockSave).toHaveBeenCalledWith({ id: 3, githubId: 'existing', firstName: 'New' });
      expect(result).toEqual([{ status: 'updated', value: 'GithubId: existing, UserId: 3' }]);
    });

    it('captures a failed status when an item throws', async () => {
      mockFindOne.mockRejectedValue(new Error('boom'));

      const result = await service.upsertUsers([{ githubId: 'oops' }]);

      expect(result).toEqual([{ status: 'failed', value: 'GithubId: oops. Error: boom' }]);
    });
  });

  describe('setActivist', () => {
    it('returns false when the user is not found', async () => {
      mockFindOne.mockResolvedValue(null);

      expect(await service.setActivist(99, true)).toBe(false);
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('persists the activist flag and returns true', async () => {
      mockFindOne.mockResolvedValue({ id: 5, activist: false });

      const ok = await service.setActivist(5, true);

      expect(ok).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(5, { activist: true });
      expect(mockSave).not.toHaveBeenCalled();
    });
  });
});
