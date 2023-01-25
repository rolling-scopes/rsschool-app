import { renderHook, act } from '@testing-library/react-hooks';
import { ProfileCourseDto } from 'api';
import { useActiveCourse } from './useActiveCourse';
import * as ReactUse from 'react-use';

describe('useActiveCourse', () => {
  const courses = [
    { id: 1, name: 'Course 1' },
    { id: 2, name: 'Course 2' },
    { id: 3, name: 'Course 3' },
  ] as ProfileCourseDto[];

  it('should return the first course as the active course by default', () => {
    const { result } = renderHook(() => useActiveCourse(courses));
    expect(result.current[0]).toEqual(courses[0]);
  });

  it('should return the previously selected course when it is stored in local storage', () => {
    jest.spyOn(ReactUse, 'useLocalStorage').mockReturnValueOnce(['2', jest.fn(), jest.fn()]);
    const { result } = renderHook(() => useActiveCourse(courses));
    expect(result.current[0]).toEqual(courses[1]);
  });

  it('should return the correct course when setActiveCourse is called', () => {
    const { result } = renderHook(() => useActiveCourse(courses));
    act(() => {
      result.current[1](3);
    });
    expect(result.current[0]).toEqual(courses[2]);
  });
});
