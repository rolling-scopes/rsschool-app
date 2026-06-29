import { getAdminMenuItems, getCourseManagementMenuItems } from './menuItems';
import * as userDomain from '@client/domain/user';
import type { Session } from '@client/components/withSession';
import type { Course } from '@client/services/models';

vi.mock('@client/domain/user');

const session = {} as Session;
const course = { id: 7, alias: 'js-2024' } as Course;

// Every predicate defaults to false; tests opt specific ones in.
function resetPredicates(value = false) {
  Object.keys(userDomain).forEach(key => {
    const fn = (userDomain as Record<string, unknown>)[key];
    if (typeof fn === 'function') {
      vi.mocked(fn as (...a: unknown[]) => boolean).mockReturnValue(value);
    }
  });
}

describe('getAdminMenuItems', () => {
  beforeEach(() => resetPredicates(false));

  it('returns no admin items when the session has no privileges', () => {
    expect(getAdminMenuItems(session)).toEqual([]);
  });

  it('returns every admin item for an admin', () => {
    vi.mocked(userDomain.isAdmin).mockReturnValue(true);

    const items = getAdminMenuItems(session);
    const keys = items.map(i => i.key);

    expect(keys).toContain('main');
    expect(keys).toContain('disciplines');
    expect(keys).toContain('notifications');
    expect(items.length).toBeGreaterThan(10);
  });

  it('shows only Applicants/Students for a hirer (non-admin)', () => {
    vi.mocked(userDomain.isHirer).mockReturnValue(true);

    const keys = getAdminMenuItems(session).map(i => i.key);

    expect(keys).toEqual(expect.arrayContaining(['applicants', 'students']));
    expect(keys).not.toContain('disciplines');
  });

  it('shows the Main item for a course power user', () => {
    vi.mocked(userDomain.isAnyCoursePowerUser).mockReturnValue(true);

    const keys = getAdminMenuItems(session).map(i => i.key);

    expect(keys).toContain('main');
    expect(keys).toContain('mentorRegistry');
  });
});

describe('getCourseManagementMenuItems', () => {
  beforeEach(() => resetPredicates(false));

  it('returns an empty array when there is no active course', () => {
    expect(getCourseManagementMenuItems(session, null)).toEqual([]);
  });

  it('returns all course management items for an admin', () => {
    vi.mocked(userDomain.isAdmin).mockReturnValue(true);

    const items = getCourseManagementMenuItems(session, course);

    expect(items).toHaveLength(11);
    expect(items[0]).toMatchObject({ key: 'courseEvents', href: '/course/admin/events?course=js-2024' });
  });

  it('filters items by course access for a non-admin course manager', () => {
    vi.mocked(userDomain.isCourseManager).mockReturnValue(true);

    const keys = getCourseManagementMenuItems(session, course).map(i => i.key);

    expect(keys).toContain('courseEvents');
    expect(keys).toContain('courseTasks');
  });

  it('builds hrefs from the active course alias', () => {
    vi.mocked(userDomain.isAdmin).mockReturnValue(true);

    const reports = getCourseManagementMenuItems(session, course).find(i => i.key === 'reports');

    expect(reports?.href).toBe('/course/admin/reports?course=js-2024');
  });
});
