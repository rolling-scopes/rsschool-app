import { CoursesApi } from '@client/api';
import { CoursesService } from './courses';

vi.mock('@client/api');

describe('CoursesService', () => {
  const createCourse = vi.mocked(CoursesApi.prototype.createCourse);
  const copyCourse = vi.mocked(CoursesApi.prototype.copyCourse);
  const getCourses = vi.mocked(CoursesApi.prototype.getCourses);
  const getCourse = vi.mocked(CoursesApi.prototype.getCourse);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createCourse delegates to the api and returns data', async () => {
    const dto = { name: 'New Course' };
    createCourse.mockResolvedValueOnce({ data: { id: 1, ...dto } } as never);

    const result = await new CoursesService().createCourse(dto as never);

    expect(createCourse).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, name: 'New Course' });
  });

  it('createCourseCopy delegates to copyCourse with id and returns data', async () => {
    const dto = { name: 'Copy' };
    copyCourse.mockResolvedValueOnce({ data: { id: 2, name: 'Copy' } } as never);

    const result = await new CoursesService().createCourseCopy(dto as never, 5);

    expect(copyCourse).toHaveBeenCalledWith(5, dto);
    expect(result).toEqual({ id: 2, name: 'Copy' });
  });

  it('getCourses returns the list of courses', async () => {
    getCourses.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] } as never);

    const result = await new CoursesService().getCourses();

    expect(getCourses).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('getCourse returns a single course by id', async () => {
    getCourse.mockResolvedValueOnce({ data: { id: 3 } } as never);

    const result = await new CoursesService().getCourse(3);

    expect(getCourse).toHaveBeenCalledWith(3);
    expect(result).toEqual({ id: 3 });
  });
});
