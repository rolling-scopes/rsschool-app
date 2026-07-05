import { getCourseLinks, getNavigationItems } from './links';
import { Session } from '@client/components/withSession';
import { Course } from '@client/services/models';
import { CourseRole } from '@client/services/models';
import Router from 'next/router';

vi.mock('next/router', () => ({ default: { push: vi.fn() } }));

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 1,
    githubId: 'user',
    isAdmin: false,
    isHirer: false,
    courses: {},
    ...overrides,
  } as Session;
}

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 10,
    name: 'Test Course',
    alias: 'tc',
    completed: false,
    planned: false,
    inviteOnly: false,
    ...overrides,
  } as Course;
}

describe('getCourseLinks', () => {
  it('returns an empty array when there is no active course', () => {
    expect(getCourseLinks(makeSession(), null)).toEqual([]);
  });

  it('returns every link for an admin regardless of roles', () => {
    const links = getCourseLinks(makeSession({ isAdmin: true }), makeCourse());
    const names = links.map(l => l.name);
    // anyAccess + role-gated + manager links are all present for admin.
    expect(names).toContain('Score');
    expect(names).toContain('My Students');
    expect(names).toContain('Expel/Unassign Student');
    expect(names).toContain('Auto-Test');
    expect(links.length).toBeGreaterThan(5);
  });

  it('exposes only public links for a user without course roles', () => {
    const links = getCourseLinks(makeSession(), makeCourse());
    const names = links.map(l => l.name);
    expect(names).toEqual(expect.arrayContaining(['Score', 'Schedule', 'Course Statistics']));
    expect(names).not.toContain('My Students');
    expect(names).not.toContain('Cross-Check: Submit');
  });

  it('includes student-only links for an active student in a non-completed course', () => {
    const session = makeSession({ courses: { 10: { roles: [CourseRole.Student], isExpelled: false } } as any });
    const links = getCourseLinks(session, makeCourse());
    const names = links.map(l => l.name);
    expect(names).toContain('Dashboard');
    expect(names).toContain('Cross-Check: Submit');
    expect(names).toContain('Interviews');
  });

  it('hides courseAccess-gated links once the course is completed', () => {
    const session = makeSession({ courses: { 10: { roles: [CourseRole.Student], isExpelled: false } } as any });
    const links = getCourseLinks(session, makeCourse({ completed: true }));
    const names = links.map(l => l.name);
    // Dashboard is gated by courseAccess (isCourseNotCompleted) -> dropped.
    expect(names).not.toContain('Dashboard');
    // Score has no courseAccess gate -> still present.
    expect(names).toContain('Score');
  });

  it('builds urls from the active course alias', () => {
    const session = makeSession({ courses: { 10: { roles: [CourseRole.Mentor], isExpelled: false } } as any });
    const links = getCourseLinks(session, makeCourse({ alias: 'my-alias' }));
    const myStudents = links.find(l => l.name === 'My Students');
    expect(myStudents?.url).toBe('/course/mentor/students?course=my-alias');
  });
});

describe('getNavigationItems', () => {
  it('returns an empty array when there is no active course', () => {
    expect(getNavigationItems(makeSession(), null)).toEqual([]);
  });

  it('returns an empty array when the active course has no id', () => {
    expect(getNavigationItems(makeSession(), makeCourse({ id: 0 }))).toEqual([]);
  });

  it('maps links to menu items with label, key and onClick', () => {
    const items = getNavigationItems(makeSession({ isAdmin: true }), makeCourse());
    expect(items!.length).toBeGreaterThan(0);
    const score = items!.find((i: any) => i.label === 'Score') as any;
    expect(score.key).toBe('/course/score?course=tc');
  });

  it('navigates via Router.push when an item is clicked', () => {
    const items = getNavigationItems(makeSession({ isAdmin: true }), makeCourse());
    const score = items!.find((i: any) => i.label === 'Score') as any;
    score.onClick();
    expect(Router.push).toHaveBeenCalledWith('/course/score?course=tc');
  });
});
