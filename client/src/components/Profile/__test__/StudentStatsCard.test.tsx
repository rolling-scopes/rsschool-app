import React from 'react';
import { mount, shallow } from 'enzyme';
import { mountToJson } from 'enzyme-to-json';
import StudentStatsCard from '../StudentStatsCard';
import { StudentStats } from '../../../../../common/models/profile';

describe('', () => {
  const githubId = 'test';
  const data = [
    {
      courseId: 1,
      courseName: 'rs-2018-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2018 Q1',
      isExpelled: false,
      expellingReason: '',
      isCourseCompleted: true,
      totalScore: 1201,
      position: 32,
      mentor: {
        githubId: 'andrew123',
        name: 'Andrey Andreev',
      },
      tasks: [
        {
          maxScore: 130,
          scoreWeight: 1,
          name: 'Task 1',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 120,
          comment: 'test',
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 2',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 20,
          comment: 'test',
        },
        {
          maxScore: 110,
          scoreWeight: 1,
          name: 'Task 3',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 90,
          comment: 'test',
        },
      ],
    },
    {
      courseId: 1,
      courseName: 'rs-2019-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2019 Q1',
      isExpelled: true,
      expellingReason: 'test',
      isCourseCompleted: false,
      totalScore: 101,
      position: 32,
      mentor: {
        githubId: 'dimon12',
        name: 'Dima Testovich',
      },
      tasks: [
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 1',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 20,
          comment: 'test',
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 2',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: null,
          comment: null,
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 3',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 10,
          comment: 'test',
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 4',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: null,
          comment: null,
        },
      ],
    },
  ] as StudentStats[];

  describe('Should render correctly', () => {
    it('if is editing mode disabled', () => {
      const output = mount(
        <StudentStatsCard
          isProfileOwner={false}
          data={data}
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={jest.fn()}
          username={githubId}
        />,
      );
      expect(mountToJson(output)).toMatchSnapshot();
    });
    it('if is editing mode enabled', () => {
      const output = mount(
        <StudentStatsCard
          isProfileOwner={false}
          data={data}
          isEditingModeEnabled={true}
          onPermissionsSettingsChange={jest.fn()}
          username={githubId}
        />,
      );
      expect(mountToJson(output)).toMatchSnapshot();
    });
  });

  const wrapper = shallow(
    <StudentStatsCard
      isProfileOwner={false}
      data={data}
      isEditingModeEnabled={true}
      onPermissionsSettingsChange={jest.fn()}
      username={githubId}
    />,
  );
  const instance: any = wrapper.instance();
  describe('showStudentStatsModal', () => {
    it('should set "state.isStudentStatsModalVisible" as "true", "state.courseIndex" as index was passed', () => {
      expect(instance.state.isStudentStatsModalVisible).toBe(false);
      expect(instance.state.courseIndex).toBe(0);
      instance.showStudentStatsModal(1);
      expect(instance.state.isStudentStatsModalVisible).toBe(true);
      expect(instance.state.courseIndex).toBe(1);
    });
  });
  describe('hideStudentStatsModal', () => {
    it('should set "state.isVisibilitySettingsVisible" as "false"', () => {
      instance.state.isStudentStatsModalVisible = true;
      expect(instance.state.isStudentStatsModalVisible).toBe(true);
      instance.hideStudentStatsModal();
      expect(instance.state.isStudentStatsModalVisible).toBe(false);
    });
  });
  describe('filterPermissions', () => {
    it('should left only "isProfileVisible" in "permissionsSettings" object', () => {
      const permissionsSettings = {
        isProfileVisible: { all: true },
        isAboutVisible: { all: true, mentor: true, student: true },
        isEducationVisible: { all: true, mentor: true, student: true },
        isEnglishVisible: { all: false, student: false },
        isEmailVisible: { all: true, student: true },
        isTelegramVisible: { all: false, student: false },
        isSkypeVisible: { all: true, student: true },
        isPhoneVisible: { all: false, student: false },
        isContactsNotesVisible: { all: true, student: true },
        isLinkedInVisible: { all: false, mentor: false, student: false },
        isPublicFeedbackVisible: { all: true, mentor: true, student: true },
        isMentorStatsVisible: { all: true, mentor: true, student: true },
        isStudentStatsVisible: { all: true, student: true },
      };
      const result = instance.filterPermissions(permissionsSettings);
      expect(result).toEqual({
        isStudentStatsVisible: { all: true, student: true },
      });
    });
  });
  describe('countScoredTasks', () => {
    it('should return number of not null tasks', () => {
      const result = instance.countScoredTasks(data[1].tasks);
      expect(result).toBe(2);
    });
  });
  describe('countCourseCompletionPercentage', () => {
    it('should return percentage of scored tasks', () => {
      const result = instance.countCourseCompletionPercentage(data[1].tasks);
      expect(result).toBe(50);
    });
  });
});
