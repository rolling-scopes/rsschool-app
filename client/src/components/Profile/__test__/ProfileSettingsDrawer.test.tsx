import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import ProfileSettingsDrawer from '../ProfileSettingsDrawer';

describe('ProfileSettingsDrawer', () => {
  it('Should render correctly', () => {
    const output = shallow(
      <ProfileSettingsDrawer
        isSettingsVisible={true}
        hideSettings={() => {}}
        content={(<div>content</div>)}
      />,
    );
    expect(shallowToJson(output)).toMatchSnapshot();
  });
});
