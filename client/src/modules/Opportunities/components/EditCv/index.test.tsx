import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { forwardRef } from 'react';
import { AxiosResponse } from 'axios';
import { Contacts, UserData } from 'modules/Opportunities/models';
import { OpportunitiesApi } from 'api';
import { EditCV } from './index';

const enum EditCvForms {
  GeneralInfoForm,
  ContactsForm,
  VisibleCoursesForm,
}

jest.mock('./GeneralInfoForm', () => ({
  GeneralInfoForm: forwardRef(() => <div>{EditCvForms.GeneralInfoForm}</div>),
}));

jest.mock('./ContactsForm', () => ({
  ContactsForm: forwardRef(() => <div>{EditCvForms.ContactsForm}</div>),
}));

jest.mock('./VisibleCoursesForm', () => ({
  VisibleCoursesForm: forwardRef(() => <div>{EditCvForms.VisibleCoursesForm}</div>),
}));

const mockGithubId = 'some-github';

const mockSwitchView = jest.fn();
const mockOnUpdateResume = jest.fn();

describe('EditCV', () => {
  test('should display forms and control buttons', () => {
    render(
      <EditCV
        githubId={mockGithubId}
        contacts={{} as Contacts}
        userData={{} as UserData}
        switchView={mockSwitchView}
        onUpdateResume={mockOnUpdateResume}
        visibleCourses={[]}
        courses={[]}
      />,
    );

    const generalInfoForm = screen.getByText(EditCvForms.GeneralInfoForm);
    const contactsForm = screen.getByText(EditCvForms.ContactsForm);
    const visibleCoursesForm = screen.getByText(EditCvForms.VisibleCoursesForm);
    const saveButton = screen.getByRole('button', { name: /save cv/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    expect(generalInfoForm).toBeInTheDocument();
    expect(contactsForm).toBeInTheDocument();
    expect(visibleCoursesForm).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  test('should switch view on Cancel button click', () => {
    render(
      <EditCV
        githubId={mockGithubId}
        contacts={{} as Contacts}
        userData={{} as UserData}
        switchView={mockSwitchView}
        onUpdateResume={mockOnUpdateResume}
        visibleCourses={[]}
        courses={[]}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    fireEvent.click(cancelButton);

    expect(mockSwitchView).toHaveBeenCalled();
  });

  test('should show notification view on Cancel button click', () => {
    render(
      <EditCV
        githubId={mockGithubId}
        contacts={{} as Contacts}
        userData={{} as UserData}
        switchView={mockSwitchView}
        onUpdateResume={mockOnUpdateResume}
        visibleCourses={[]}
        courses={[]}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    fireEvent.click(cancelButton);

    expect(mockSwitchView).toHaveBeenCalled();
  });

  test('should save data on Save button click and show success notification', async () => {
    const mockSaveResume = jest
      .spyOn(OpportunitiesApi.prototype, 'saveResume')
      .mockResolvedValue({ data: {} } as AxiosResponse);

    render(
      <EditCV
        githubId={mockGithubId}
        contacts={{} as Contacts}
        userData={{} as UserData}
        switchView={mockSwitchView}
        onUpdateResume={mockOnUpdateResume}
        visibleCourses={[]}
        courses={[]}
      />,
    );

    const saveButton = await screen.findByRole('button', { name: /save cv/i });

    fireEvent.click(saveButton);

    expect(mockSaveResume).toHaveBeenCalledWith(mockGithubId, expect.any(Object));

    await waitFor(() => {
      expect(mockOnUpdateResume).toHaveBeenCalled();
    });

    expect(screen.getByText(/cv sucessfully updated/i)).toBeInTheDocument();
  });
});
