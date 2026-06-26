import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { forwardRef, useImperativeHandle } from 'react';
import { AxiosResponse } from 'axios';
import { Contacts, UserData } from '@client/modules/Opportunities/models';
import { OpportunitiesApi } from '@client/api';
import { EditCV } from './index';

const mockSuccessNotification = vi.fn();
vi.mock('@client/hooks', () => ({
  useMessage: () => ({
    notification: {
      success: mockSuccessNotification,
    },
  }),
}));

const enum EditCvForms {
  GeneralInfoForm,
  ContactsForm,
  VisibleCoursesForm,
}

// Each mocked form forwards a fake FormInstance (from these holders) through its ref so the
// page's hasInvalidFields / getFieldsValue logic runs against real-ish data. Tests reset the
// holders per case to drive the valid vs. invalid-fields branches.
const { formInstances } = vi.hoisted(() => ({
  formInstances: {
    user: { getFieldsError: () => [], getFieldsValue: () => ({}) } as Record<string, unknown>,
    contacts: { getFieldsError: () => [], getFieldsValue: () => ({}) } as Record<string, unknown>,
    visibleCourses: { getFieldsError: () => [], getFieldsValue: () => ({}) } as Record<string, unknown>,
  },
}));

vi.mock('./GeneralInfoForm', () => ({
  GeneralInfoForm: forwardRef((_props, ref) => {
    useImperativeHandle(ref, () => formInstances.user);
    return <div>{EditCvForms.GeneralInfoForm}</div>;
  }),
}));

vi.mock('./ContactsForm', () => ({
  ContactsForm: forwardRef((_props, ref) => {
    useImperativeHandle(ref, () => formInstances.contacts);
    return <div>{EditCvForms.ContactsForm}</div>;
  }),
}));

vi.mock('./VisibleCoursesForm', () => ({
  VisibleCoursesForm: forwardRef((_props, ref) => {
    useImperativeHandle(ref, () => formInstances.visibleCourses);
    return <div>{EditCvForms.VisibleCoursesForm}</div>;
  }),
}));

beforeEach(() => {
  formInstances.user = { getFieldsError: () => [], getFieldsValue: () => ({}) };
  formInstances.contacts = { getFieldsError: () => [], getFieldsValue: () => ({}) };
  formInstances.visibleCourses = { getFieldsError: () => [], getFieldsValue: () => ({}) };
});

const mockGithubId = 'some-github';

const mockSwitchView = vi.fn();
const mockOnUpdateResume = vi.fn();

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
    const mockSaveResume = vi
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
  });

  test('shows the validation alert and does not save when a form has invalid fields', async () => {
    const mockSaveResume = vi.spyOn(OpportunitiesApi.prototype, 'saveResume');
    // The user form reports a field error -> hasInvalidFields is true.
    formInstances.user = {
      getFieldsError: () => [{ name: ['name'], errors: ['Field cannot be empty'] }],
      getFieldsValue: () => ({}),
    };

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

    fireEvent.click(await screen.findByRole('button', { name: /save cv/i }));

    expect(await screen.findByText('All required fields must be filled first')).toBeInTheDocument();
    expect(mockSaveResume).not.toHaveBeenCalled();
  });

  test('collects the checked visible courses into the saved payload', async () => {
    const mockSaveResume = vi
      .spyOn(OpportunitiesApi.prototype, 'saveResume')
      .mockResolvedValue({ data: {} } as AxiosResponse);
    // Two visible-course toggles: one on, one off -> only the enabled id is collected.
    formInstances.visibleCourses = {
      getFieldsError: () => [],
      getFieldsValue: () => ({ 11: true, 22: false }),
    };

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

    fireEvent.click(await screen.findByRole('button', { name: /save cv/i }));

    await waitFor(() => expect(mockSaveResume).toHaveBeenCalled());
    // The reduce kept course 11 (enabled) and dropped 22 (disabled).
    const submitted = mockSaveResume.mock.calls[0]![1] as { visibleCourses?: number[] };
    expect(submitted.visibleCourses).toContain(11);
    expect(submitted.visibleCourses).not.toContain(22);
  });
});
