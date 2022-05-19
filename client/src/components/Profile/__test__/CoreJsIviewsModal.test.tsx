import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import CoreJsIviewsModal from '../CoreJsIviewsModal';

describe('CoreJsIviewsModal', () => {
  it('Should render correctly', () => {
    const wrapper = shallow(
      <CoreJsIviewsModal
        stats={{
          courseFullName: 'TEST COURSE',
          courseName: 'TEST COURSE',
          locationName: null,
          interviews: [
            {
              score: 9,
              comment: 'Very good understanding of core features. Minus one point for being not confident in some tasks(variable scope, closure), also for not solving coding task completely',
              interviewer: {
                name: 'test name',
                githubId: 'testId',
              },
              answers: [
                {
                  questionId: '1001',
                  questionText: 'What is JSX?',
                },
                {
                  answer: true,
                  questionId: '1002',
                  questionText: 'Is it possible to use React without JSX?',
                },
                {
                  answer: true,
                  questionId: '1011',
                  questionText: 'What is the virtual DOM? How does react use the virtual DOM to render the UI?',
                },
                {
                  questionId: '1012',
                  questionText: 'Is the virtual DOM the same as the shadow DOM?',
                },
                {
                  questionId: '1082',
                  questionText: 'What are the limitations of React?',
                },
                {
                  questionId: '1083',
                  questionText: 'What is a higher order component?',
                },
              ],
              name: 'int',
              interviewDate: 'Thu May 19 2022 08:58:04 GMT+0000 (GMT)',
            },
          ],
        }}
        isVisible={true}
        onHide={jest.fn()}
        interviewIndex={0}
      />,
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
