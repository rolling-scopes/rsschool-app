import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import type { NextRouter } from 'next/router';
import type { CourseService } from '@client/services/course';
import { useScorePaging } from './useScorePaging';

function makeRouter(query: NextRouter['query'] = {}): NextRouter {
  return {
    query,
    pathname: '/score',
    push: vi.fn(),
  } as unknown as NextRouter;
}

function makeCourseService(score: unknown) {
  return {
    getCourseScore: vi.fn().mockResolvedValue(score),
  } as unknown as CourseService;
}

const scorePage = {
  content: [{ githubId: 'alice', totalScore: 90 }],
  pagination: { current: 1, pageSize: 100, total: 1, totalPages: 1 },
};

const pagination = { current: 1, pageSize: 100 };

describe('useScorePaging', () => {
  it('requests the course score with merged filters/activeOnly and the resolved sort field', async () => {
    const router = makeRouter();
    const courseService = makeCourseService(scorePage);
    const { result } = renderHook(() => useScorePaging(router, courseService, true));

    let response: unknown;
    await act(async () => {
      response = await result.current[0](
        pagination,
        { githubId: ['alice'], name: undefined, cityName: undefined, 'mentor.githubId': undefined },
        { column: { sorter: 'totalScore' }, order: 'descend' } as never,
      );
    });

    expect(courseService.getCourseScore).toHaveBeenCalledWith(
      pagination,
      expect.objectContaining({ githubId: ['alice'], activeOnly: true }),
      { field: 'totalScore', order: 'descend' },
    );
    expect(response).toEqual({ content: scorePage.content, pagination: scorePage.pagination });
  });

  it('defaults the sort field to "rank" when no column sorter is present', async () => {
    const router = makeRouter();
    const courseService = makeCourseService(scorePage);
    const { result } = renderHook(() => useScorePaging(router, courseService, false));

    await act(async () => {
      await result.current[0](pagination, {}, { column: undefined, order: undefined } as never);
    });

    expect(courseService.getCourseScore).toHaveBeenCalledWith(
      pagination,
      expect.objectContaining({ activeOnly: false }),
      { field: 'rank', order: undefined },
    );
  });

  it('pushes the filter values onto the router query (shallow) before fetching', async () => {
    const router = makeRouter({ tab: 'active' });
    const courseService = makeCourseService(scorePage);
    const { result } = renderHook(() => useScorePaging(router, courseService, true));

    await act(async () => {
      await result.current[0](
        pagination,
        { githubId: ['bob'], cityName: ['Minsk'], name: undefined, 'mentor.githubId': undefined },
        { column: undefined, order: undefined } as never,
      );
    });

    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/score',
        query: expect.objectContaining({ tab: 'active', githubId: 'bob', cityName: 'Minsk' }),
      }),
      undefined,
      { shallow: true },
    );
  });
});
