import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import AboutCard from '../AboutCard';
import { GeneralInfo } from '../../../../../common/models/profile';

describe('AboutCard', () => {
  describe('Should render correctly', () => {
    it('if "aboutMyself" is present', () => {
      const output = shallow(
        <AboutCard
          data={{
            aboutMyself: 'Top contributor of Rolling Scopes',
          } as GeneralInfo}
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={() => {}}
          onProfileSettingsChange={() => {}}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if "aboutMyself" is not present', () => {
      const output = shallow(
        <AboutCard
          data={{} as GeneralInfo}
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={() => {}}
          onProfileSettingsChange={() => {}}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
  });
});
