import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import PublicFeedbackModal from '../PublicFeedbackModal';

describe('PublicFeedbackModal', () => {
  const data = [
    {
      feedbackDate: '2018-12-01T12:12:01.000Z',
      badgeId: 'Congratulations',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Anton Petrov',
        githubId: 'apetr',
      },
    },
    {
      feedbackDate: '2018-11-01T11:12:01.000Z',
      badgeId: 'Great_speaker',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Artem Petrov',
        githubId: 'temap',
      },
    },
    {
      feedbackDate: '2018-09-01T11:12:01.000Z',
      badgeId: 'Great_speaker',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Artem Petrov',
        githubId: 'temap',
      },
    },
    {
      feedbackDate: '2018-10-01T11:12:01.000Z',
      badgeId: 'Great_speaker',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Artem Petrov',
        githubId: 'temap',
      },
    },
    {
      feedbackDate: '2018-11-01T12:12:01.000Z',
      badgeId: 'Thank_you',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Anton Vasilyev',
        githubId: 'vasssa',
      },
    },
    {
      feedbackDate: '2019-12-01T12:12:01.000Z',
      badgeId: 'Thank_you',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Dima Alexandrov',
        githubId: 'demaa',
      },
    },
  ];

  it('Should render correctly', () => {
    const output = shallow(<PublicFeedbackModal data={data} isVisible={true} onHide={jest.fn()} />);
    expect(shallowToJson(output)).toMatchSnapshot();
  });
});
