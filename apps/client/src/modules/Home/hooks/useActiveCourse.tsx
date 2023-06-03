import { useState } from 'react';
import { useLocalStorage } from 'react-use';
import { Course } from 'services/models';

export function useActiveCourse(courses: Course[]): [Course | null, (courseId: number) => void] {
  const [courseId, setCourseId] = useState<number>();
  const [storageValue, setStorageValue] = useLocalStorage('activeCourseId');
  const activeCourseId = courseId || Number(storageValue);
  const course = courses.find(course => course.id === activeCourseId) ?? courses[0];
  return [
    course,
    (courseId: number) => {
      setCourseId(courseId);
      setStorageValue(courseId);
    },
  ];
}
