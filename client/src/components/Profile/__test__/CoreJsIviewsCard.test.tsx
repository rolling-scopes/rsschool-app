import React from 'react';
import { mount } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import CoreJsIviewsCard from '../CoreJsIviewsCard';

describe('CoreJSIviewsCard', () => {
  const wrapper = mount<CoreJsIviewsCard>(
    <CoreJsIviewsCard
      data={[
        {
          courseFullName: 'rs-2019',
          courseName: 'rs-2019',
          locationName: 'minsk',
          interviews: [
            {
              answers: [
                {
                  answer: 'yes',
                  questionText: 'test',
                  questionId: 'test',
                },
                {
                  answer: 'no',
                  questionText: 'test',
                  questionId: 'test',
                },
              ],
              interviewer: {
                name: 'Dzmitry Petrov',
                githubId: 'dima',
              },
              comment: 'test',
              score: 4,
            },
          ],
        },
      ]}
    />,
  );
  it('Should render correctly', () => {
    expect(shallowToJson(wrapper as any)).toMatchSnapshot();
  });
  describe('showCoreJsIviewModal', () => {
    it('should set "state.isCoreJsIviewModalVisible" as "true", "state.courseIndex" as passed', () => {
      const instance: any = wrapper.instance();
      expect(instance.state.isCoreJsIviewModalVisible).toBe(false);
      instance.showCoreJsIviewModal(0, 0);
      expect(instance.state.isCoreJsIviewModalVisible).toBe(true);
    });
  });
  describe('hideCoreJsIviewModal', () => {
    it('should set "state.isCoreJsIviewModalVisible" as "false"', () => {
      const instance = wrapper.instance();
      instance.state.isCoreJsIviewModalVisible = true;
      expect(instance.state.isCoreJsIviewModalVisible).toBe(true);
      (instance as any).hideCoreJsIviewModal();
      expect(instance.state.isCoreJsIviewModalVisible).toBe(false);
    });
  });
});
