import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import CoreJsIviewsModal from '../CoreJsIviewsModal';

describe('CoreJsIviewsModal', () => {
  it('Should render correctly', () => {
    const wrapper = shallow(
      <CoreJsIviewsModal
        stats={{
          courseFullName: 'rs-2019',
          courseName: 'rs-2019',
          locationName: 'minsk',
          interview: {
            answers: [
              {
                answer: 'true',
                questionText: 'test',
                questionId: 'test',
              },
              {
                answer: 'false',
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
        }}
        isVisible={true}
        onHide={jest.fn()}
      />,
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
