import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import MentorStatsModal from '../MentorStatsModal';

describe('MentorStatsModal', () => {
  it('Should render correctly', () => {
    const output = shallow(
      <MentorStatsModal
        stats={{
          courseName: 'rs-2018-q1',
          locationName: 'Minsk',
          courseFullName: 'Rolling Scopes School 2018-Q1',
          students: [
            {
              githubId: 'alex',
              name: 'Alex Petrov',
              isExpelled: false,
              totalScore: 3453,
            },
            {
              githubId: 'vasya',
              name: 'Vasiliy Alexandrov',
              isExpelled: true,
              totalScore: 120,
            },
          ],
        }}
        isVisible={true}
        onHide={jest.fn()}
      />,
    );
    expect(shallowToJson(output)).toMatchSnapshot();
  });
});
