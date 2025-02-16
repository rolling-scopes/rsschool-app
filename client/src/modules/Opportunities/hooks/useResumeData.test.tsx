import { renderHook, waitFor } from '@testing-library/react';
import { OpportunitiesApi, ResumeDto } from 'api';
import { useResumeData } from './useResumeData';
import { AxiosResponse } from 'axios';

const mockGithubId = 'test';
const mockActualTime = 1664564110455;
const mockResumeData = {
  data: 'test',
};

describe('useResumeData', () => {
  it('should return resume data', async () => {
    jest.spyOn(OpportunitiesApi.prototype, 'getResume').mockImplementation(() =>
      Promise.resolve({
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        data: mockResumeData as unknown as ResumeDto,
      } as AxiosResponse<ResumeDto>),
    );
    const { result } = renderHook(() => useResumeData({ githubId: mockGithubId, actualTime: mockActualTime }));
    await waitFor(() => {
      expect(result.current[0]).toBe(mockResumeData);
    });
  });

  it('should return null in case of 404 error', async () => {
    jest.spyOn(OpportunitiesApi.prototype, 'getResume').mockImplementation(() =>
      Promise.reject({
        response: {
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {},
        },
      }),
    );
    const { result } = renderHook(() => useResumeData({ githubId: mockGithubId, actualTime: mockActualTime }));
    await waitFor(() => {
      expect(result.current[0]).toBe(null);
    });
  });

  it('should throw error in case of unexpected error', async () => {
    const mockErrorResponse = {
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      },
    };
    jest.spyOn(OpportunitiesApi.prototype, 'getResume').mockImplementation(() => Promise.reject(mockErrorResponse));
    const { result } = renderHook(() => useResumeData({ githubId: mockGithubId, actualTime: mockActualTime }));
    await waitFor(() => {
      expect(result.current[1]).toBe(mockErrorResponse);
    });
  });
});
