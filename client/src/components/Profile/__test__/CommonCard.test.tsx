import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import CommonCard from '../CommonCard';

describe('CommonCard', () => {
  describe('Should render correctly', () => {
    it('if just basic props is present', () => {
      const output = shallow(
        <CommonCard
          title="Test"
          icon={<i>Icon</i>}
          content={<p>Card body</p>}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if is editing mode enabled', () => {
      const output = shallow(
        <CommonCard
          title="Test"
          icon={<i>Icon</i>}
          content={<p>Card body</p>}
          isEditingModeEnabled={true}
          profileSettingsContent={<p>Settings</p>}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if is null content passed', () => {
      const output = shallow(
        <CommonCard
          title="Test"
          icon={<i>Icon</i>}
          content={null}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
  });

  const wrapper = shallow<CommonCard>(
    <CommonCard
      title="Test"
      icon={<i>Icon</i>}
      content={<p>Content</p>}
    />);
  const instance: any = wrapper.instance();
  describe('showVisibilitySettings', () => {
    it('should set "state.isVisibilitySettingsVisible" as "true"', () => {
      expect(instance.state.isVisibilitySettingsVisible).toBe(false);
      instance.showVisibilitySettings();
      expect(instance.state.isVisibilitySettingsVisible).toBe(true);
    });
  });
  describe('hideVisibilitySettings', () => {
    it('should set "state.isVisibilitySettingsVisible" as "false"', () => {
      instance.state.isVisibilitySettingsVisible = true;
      expect(instance.state.isVisibilitySettingsVisible).toBe(true);
      instance.hideVisibilitySettings();
      expect(instance.state.isVisibilitySettingsVisible).toBe(false);
    });
  });
  describe('showProfileSettings', () => {
    it('should set "state.isProfileSettingsVisible" as "true"', () => {
      expect(instance.state.isProfileSettingsVisible).toBe(false);
      instance.showProfileSettings();
      expect(instance.state.isProfileSettingsVisible).toBe(true);
    });
  });
  describe('hideProfileSettings', () => {
    it('should set "state.isProfileSettingsVisible" as "false"', () => {
      instance.state.isProfileSettingsVisible = true;
      expect(instance.state.isProfileSettingsVisible).toBe(true);
      instance.hideProfileSettings();
      expect(instance.state.isProfileSettingsVisible).toBe(false);
    });
  });
});
