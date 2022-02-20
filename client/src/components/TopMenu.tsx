import {
  AudioTwoTone,
  BankTwoTone,
  CalendarTwoTone,
  CheckCircleTwoTone,
  CodeTwoTone,
  ContactsTwoTone,
  DashboardTwoTone,
  GoldTwoTone,
  HighlightTwoTone,
  InfoCircleTwoTone,
  QuestionCircleTwoTone,
  PlayCircleTwoTone,
  StarTwoTone,
  TrophyTwoTone,
  CrownTwoTone,
  FireTwoTone,
  EyeTwoTone,
  EditTwoTone,
  SettingTwoTone,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import Link from 'next/link';

type Props = { githubId: string };

const courseColor = 'orange';
const studentColor = '#52c41a';
const mentorColor = '#7f00ff';
const managerColor = '#eb2f96';
const adminColor = '#666666';
const schoolColor = '#ff1a1a';

export function TopMenu(props: Props) {
  const myProfile = (
    <>
      <GithubAvatar githubId={props.githubId} size={16} /> My Profile
    </>
  );

  return (
    <Menu
      style={{ backgroundColor: '#f0f2f5', borderBottom: 'solid 1px #d9d9d9' }}
      className="top-menu"
      mode="horizontal"
    >
      <Menu.Item>
        <Link href="/">
          <a>
            <img style={{ height: 16 }} src="https://rs.school/favicon.ico" alt="Rolling Scopes School Logo" />
          </a>
        </Link>
      </Menu.Item>
      <Menu.SubMenu key="profile" title={myProfile}>
        <Menu.Item key="profile-view" icon={<EyeTwoTone />}>
          View
        </Menu.Item>
        <Menu.Item key="profile-edit" icon={<EditTwoTone />}>
          Edit
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="profile-cv" icon={<FireTwoTone />}>
          My CV
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="profile-logout">Logout</Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu key="admin" title="Admin" icon={<SettingTwoTone twoToneColor={adminColor} />}>
        <Menu.Item key="admin-courses">Courses</Menu.Item>
        <Menu.Item key="admin-tasks">Tasks</Menu.Item>
        <Menu.Item key="admin-events">Events</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="admin-mentors">Registry</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="admin-notifications">Notifications</Menu.Item>
        <Menu.Item key="admin-users">Users</Menu.Item>
        <Menu.Item key="admin-user-groups">User Groups</Menu.Item>
        <Menu.Item key="admin-discord">Discord</Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu key="course" title="Course" icon={<BankTwoTone twoToneColor={courseColor} />}>
        <Menu.Item key="course-score" icon={<TrophyTwoTone twoToneColor={courseColor} />}>
          Score
        </Menu.Item>
        <Menu.Item key="course-schedule" icon={<CalendarTwoTone twoToneColor={courseColor} />}>
          Schedule
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu key="student" title="Student" icon={<ContactsTwoTone twoToneColor={studentColor} />}>
        <Menu.Item key="student-dashboard" icon={<DashboardTwoTone twoToneColor={studentColor} />}>
          Dashboard
        </Menu.Item>
        <Menu.Item key="student-autotest" icon={<PlayCircleTwoTone twoToneColor={studentColor} />}>
          Auto-Test
        </Menu.Item>
        <Menu.Item key="student-interviews" icon={<AudioTwoTone twoToneColor={studentColor} />}>
          Interviews
        </Menu.Item>
        <Menu.Divider />
        <Menu.ItemGroup title="Cross-Check">
          <Menu.Item key="student-crosscheck-submit" icon={<CodeTwoTone twoToneColor={studentColor} />}>
            Submit
          </Menu.Item>
          <Menu.Item key="student-crosscheck-review" icon={<HighlightTwoTone twoToneColor={studentColor} />}>
            Review
          </Menu.Item>
        </Menu.ItemGroup>
      </Menu.SubMenu>
      <Menu.SubMenu key="mentor" title="Mentor" icon={<StarTwoTone twoToneColor={mentorColor} />}>
        <Menu.Item key="mentor-students" icon={<GoldTwoTone twoToneColor={mentorColor} />}>
          My Students
        </Menu.Item>
        <Menu.Item key="mentor-review" icon={<CheckCircleTwoTone twoToneColor={mentorColor} />}>
          Submit Review
        </Menu.Item>
        <Menu.Item key="mentor-interviews" icon={<AudioTwoTone twoToneColor={mentorColor} />}>
          Interviews
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu key="manager" title="Manager" icon={<CrownTwoTone twoToneColor={managerColor} />}>
        <Menu.Item key="manager-tasks">Course Tasks</Menu.Item>
        <Menu.Item key="manager-students">Course Students</Menu.Item>
        <Menu.Item key="manager-mentors">Course Mentors</Menu.Item>
        <Menu.Item key="manager-users">Course Users</Menu.Item>
        <Menu.Item key="manager-cross-check">Cross Check Table</Menu.Item>
        <Menu.Item key="manager-technical-screening">Technical Screening</Menu.Item>
        <Menu.Item key="manager-interviews">Course Interviews</Menu.Item>
      </Menu.SubMenu>

      <Menu.Item key="help" icon={<QuestionCircleTwoTone />}>
        Help
      </Menu.Item>
      <Menu.SubMenu key="school" title="RS School" icon={<InfoCircleTwoTone twoToneColor={schoolColor} />}>
        <Menu.Item key="school-docs">Docs</Menu.Item>
        <Menu.Item key="school-heroes">Heroes</Menu.Item>
        <Menu.Item key="school-gratitude">#Gratitude</Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
}
