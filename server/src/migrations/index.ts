import { UserMigration1630340371992 } from './1630340371992-UserMigration';
import { TaskResult1630341383942 } from './1630341383942-TaskResult';
import { StudentMigration1630342025950 } from './1630342025950-StudentMigration';
import { UserMigration1630342266002 } from './1630342266002-UserMigration';
import { StudentMigration1630347897950 } from './1630347897950-StudentMigration';
import { ResumeMigration1632333725126 } from './1632333725126-ResumeMigration';
import { User1635365797478 } from './1635365797478-User';
import { StageInterview1637591194886 } from './1637591194886-StageInterview';
import { Indicies1639418471577 } from './1639418471577-Indicies';
import { Student1639502600339 } from './1639502600339-Student';
import { CourseMigration1638302439645 } from './1638302439645-CourseMigration';
import { Update1639427578702 } from './1639427578702-Update';
import { ResumeSelectCourses1642884123347 } from './1642884123347-ResumeSelectCourses';
import { Task1643481312933 } from './1643481312933-Task';
import { LoginState1643550350939 } from './1643550350939-LoginState';
import { Notifications1643926895264 } from './1643926895264-Notifications';
import { NotificationConnection1644695410918 } from './1644695410918-NotificationConnection';
import { RepositoryEvent1645364514538 } from './1645364514538-RepositoryEvent';
import { CrossCheckScheduling1647103154082 } from './1647103154082-CrossCheckScheduling';
import { Opportunitites1645654601903 } from './1645654601903-Opportunitites';
import { TaskSolutionConstraint1647175301446 } from './1647175301446-TaskSolutionConstraint';
import { NotificationType1647550751147 } from './1647550751147-NotificationType';
import { LoginStateUserId1647885219936 } from './1647885219936-LoginStateUserId';
import { CourseLogo1649505252996 } from './1649505252996-CourseLogo';
import { CourseLogo1649868994688 } from './1649868994688-CourseLogo';
import { DiscordChannel1650652882300 } from './1650652882300-DiscordChannel';
import { Resume1652870756742 } from './1652870756742-Resume';
import { History1656326258991 } from './1656326258991-History';
import { Feedback1661034658479 } from './1661034658479-Feedback';
import { Discipline1661087975938 } from './1661087975938-Discipline';
import { Disciplines1661106736439 } from './1661106736439-Disciplines';
import { Disciplines1661107174477 } from './1661107174477-Disciplines';
import { NotificationCategory1661616212488 } from './1661616212488-NotificationCategory';
import { CourseTask1662275601017 } from './1662275601017-CourseTask';
import { CourseEvent1664183799115 } from './1664183799115-CourseEvent';
import { TaskCriteria1666348642811 } from './1666348642811-TaskCriteria';
import { TaskSolutionResult1666621080327 } from './1666621080327-TaskSolutionResult';
import { TeamDistribution1672142743107 } from './1672142743107-TeamDistribution';
import { Tasks1671475396333 } from './1671475396333-Tasks';
import { TeamDistribution1672386450861 } from './1672386450861-TeamDistribution';
import { TaskVerification1673090827105 } from './1673090827105-TaskVerification';
import { User1673692838338 } from './1673692838338-User';
import { Team1674128274839 } from './1674128274839-Team';
import { TeamDistributionStudent1674377676805 } from './1674377676805-TeamDistributionStudent';
import { Resume1674755854609 } from './1674755854609-Resume';
import { UserGroup1675245424426 } from './1675245424426-UserGroup';
import { User1676139987317 } from './1676139987317-User';
import { Course1675345245770 } from './1675345245770-Course';
import { MentorRegistry1685197747051 } from './1685197747051-MentorRegistry';
import { Prompt1687009744110 } from './1687009744110-Prompt';
import { Temperature1691520611773 } from './1691520611773-Temperature';
import { Temperature1691524327332 } from './1691524327332-Temperature';
import { InterviewScore1686657350908 } from './1686657350908-InterviewScore';
import { CourseUsersActivist1693930286280 } from './1693930286280-CourseUsersActivist';
import { AddMinStudentPerMentorColumnToCourse1699808604000 } from './1699808604000-AddMinStudentPerMentorColumnToCourse';
import { Obfuscation1700391857109 } from './1700391857109-Obfuscation';
import { Course1712137476312 } from './1712137476312-Course';
import { CourseTask1730926720293 } from './1730926720293-CourseTask';
import { Contributor1734874453585 } from './1734874453585-Contributor';
import { Course1736458672717 } from './1736458672717-Course';
import { CoursePersonalMentoringDates1738250779923 } from './1738250779923-CoursePersonalMentoringDates';

export const migrations = [
  UserMigration1630340371992,
  TaskResult1630341383942,
  StudentMigration1630342025950,
  UserMigration1630342266002,
  StudentMigration1630347897950,
  ResumeMigration1632333725126,
  User1635365797478,
  StageInterview1637591194886,
  Indicies1639418471577,
  Student1639502600339,
  CourseMigration1638302439645,
  Update1639427578702,
  ResumeSelectCourses1642884123347,
  Task1643481312933,
  LoginState1643550350939,
  Notifications1643926895264,
  NotificationConnection1644695410918,
  RepositoryEvent1645364514538,
  CrossCheckScheduling1647103154082,
  Opportunitites1645654601903,
  TaskSolutionConstraint1647175301446,
  NotificationType1647550751147,
  LoginStateUserId1647885219936,
  CourseLogo1649505252996,
  CourseLogo1649868994688,
  DiscordChannel1650652882300,
  Resume1652870756742,
  History1656326258991,
  Feedback1661034658479,
  Discipline1661087975938,
  Disciplines1661106736439,
  Disciplines1661107174477,
  NotificationCategory1661616212488,
  CourseTask1662275601017,
  CourseEvent1664183799115,
  TaskCriteria1666348642811,
  TaskSolutionResult1666621080327,
  TeamDistribution1672142743107,
  TeamDistribution1672386450861,
  Tasks1671475396333,
  TaskVerification1673090827105,
  User1673692838338,
  Team1674128274839,
  TeamDistributionStudent1674377676805,
  Resume1674755854609,
  UserGroup1675245424426,
  User1676139987317,
  Course1675345245770,
  MentorRegistry1685197747051,
  Prompt1687009744110,
  Temperature1691520611773,
  Temperature1691524327332,
  InterviewScore1686657350908,
  CourseUsersActivist1693930286280,
  AddMinStudentPerMentorColumnToCourse1699808604000,
  Obfuscation1700391857109,
  Course1712137476312,
  CourseTask1730926720293,
  Contributor1734874453585,
  Course1736458672717,
  CoursePersonalMentoringDates1738250779923,
];
