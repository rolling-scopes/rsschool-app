import { fireEvent, render, screen } from '@testing-library/react';
import { forwardRef } from 'react';
import { Contacts, UserData } from 'modules/Opportunities/models';
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

const mockGithubId = 'alreadybored';

const mockSwitchView = jest.fn();
const mockOnUpdateResume = jest.fn();

// TODO: Add tests for data submit after merge of
// Opportunities API migration to avoid conflicts
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
});
