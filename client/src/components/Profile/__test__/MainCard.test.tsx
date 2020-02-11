import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import MainCard from '../MainCard';

describe('MainCard', () => {
  describe('Should render correctly', () => {
    it('if is editing mode disabled', () => {
      const output = shallow(
        <MainCard
          data={{
            name: 'Petr Pervyi',
            githubId: 'piter',
            locationName: 'SPB',
            locationId: '1',
          }}
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={() => {}}
          onProfileSettingsChange={() => {}}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
  });

  // const wrapper = shallow(
  //   <MainCard
  //     data={{
  //       name: 'Petr Pervyi',
  //       githubId: 'piter',
  //       locationName: 'SPB',
  //       locationId: '1',
  //     }}
  //     isEditingModeEnabled={false}
  //     onPermissionsSettingsChange={() => {}}
  //     onProfileSettingsChange={() => {}}
  //   />);
  // const instance = wrapper.instance();
  // describe('showVisibilitySettings', () => {
  //   it('should set "state.isVisibilitySettingsVisible" as "true"', () => {
  //     expect(instance.state.isVisibilitySettingsVisible).toBe(false);
  //     instance.showVisibilitySettings();
  //     expect(instance.state.isVisibilitySettingsVisible).toBe(true);
  //   });
  // });
  // describe('hideVisibilitySettings', () => {
  //   it('should set "state.isVisibilitySettingsVisible" as "false"', () => {
  //     instance.state.isVisibilitySettingsVisible = true;
  //     expect(instance.state.isVisibilitySettingsVisible).toBe(true);
  //     instance.hideVisibilitySettings();
  //     expect(instance.state.isVisibilitySettingsVisible).toBe(false);
  //   });
  // });
  // describe('showProfileSettings', () => {
  //   it('should set "state.isProfileSettingsVisible" as "true"', () => {
  //     expect(instance.state.isProfileSettingsVisible).toBe(false);
  //     instance.showProfileSettings();
  //     expect(instance.state.isProfileSettingsVisible).toBe(true);
  //   });
  // });
  // describe('hideProfileSettings', () => {
  //   it('should set "state.isProfileSettingsVisible" as "false"', () => {
  //     instance.state.isProfileSettingsVisible = true;
  //     expect(instance.state.isProfileSettingsVisible).toBe(true);
  //     instance.hideProfileSettings();
  //     expect(instance.state.isProfileSettingsVisible).toBe(false);
  //   });
  // });
});
