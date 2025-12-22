import { render, screen } from '@testing-library/react';
import { ResumeDto } from '@client/api';
import { ExpirationState } from 'modules/Opportunities/constants';
import { useViewData, useExpiration } from 'modules/Opportunities/hooks';
import { ViewCV } from './index';

jest.mock('modules/Opportunities/components/ExpirationTooltip', () => ({
  ExpirationTooltip: () => <div>ExpirationTooltip</div>,
}));

jest.mock('./AboutSection', () => ({
  AboutSection: () => <div>AboutSection</div>,
}));

jest.mock('./ContactsSection', () => ({
  ContactsSection: () => <div>ContactsSection</div>,
}));

jest.mock('./CoursesSection', () => ({
  CoursesSection: () => <div>CoursesSection</div>,
}));

jest.mock('./FeedbackSection', () => ({
  FeedbackSection: () => <div>FeedbackSection</div>,
}));

jest.mock('./GratitudeSection', () => ({
  GratitudeSection: () => <div>GratitudeSection</div>,
}));

jest.mock('./PersonalSection', () => ({
  PersonalSection: () => <div>PersonalSection</div>,
}));

jest.mock('../NameTitle', () => ({
  NameTitle: () => <div>NameTitle</div>,
}));

jest.mock('../PublicLink', () => ({
  PublicLink: ({ url }: { url: string }) => <div>PublicLink {url}</div>,
}));

jest.mock('./ActionButtons', () => ({
  ActionButtons: () => <div>ActionButtons</div>,
}));

jest.mock('modules/Opportunities/hooks');

/*
    Preerequisities:
    1. Mock usViewData hook
    2. Mock use expiration

    Test cases:
    1. If loading is true, then LoadingScreen should be displayed
    2.Loading = false + public mode = true => PublicLink should be displayed
    3.Loading = false + public mode = false => ActionButtons should be displayed

    Mock ExpirationTooltip
    Mock NameTitle
    Mock PersonalSection
    Mock ContactsSection
    Mock AboutSection
    Mock CoursesSection
    Mock FeedbackSection
    Mock GratitudeSection
    4.Loading = false + userData => Expiration
*/

const mockOrigin = 'htps://example.com';
const mockUuid = '13791ec3-83b9-44ce-95c5-f06837a71966';

describe('ViewCV', () => {
  let originalWindowLocation: string;

  beforeAll(() => {
    originalWindowLocation = window.location.href;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { origin: mockOrigin },
    });
  });

  afterAll(() => {
    window.location.href = originalWindowLocation;
  });

  test('should display loading screeen if loading is true', () => {
    (useViewData as jest.Mock).mockReturnValue({ loading: true });
    (useExpiration as jest.Mock).mockReturnValue({
      expirationState: ExpirationState.NotExpired,
      expirationDateFormatted: '2021-01-01',
    });

    render(<ViewCV initialData={{} as ResumeDto} />);

    const loadingScreen = screen.getByText('Loading...');

    expect(loadingScreen).toBeInTheDocument();
  });

  test('should display public link in public mode', () => {
    (useViewData as jest.Mock).mockReturnValue({ loading: false, uuid: mockUuid });
    (useExpiration as jest.Mock).mockReturnValue({
      expirationState: ExpirationState.NotExpired,
      expirationDateFormatted: '2021-01-01',
    });

    render(<ViewCV initialData={{} as ResumeDto} publicMode={true} />);

    const publicLink = screen.getByText(`PublicLink ${mockOrigin}/cv/${mockUuid}`);
    const actionButtons = screen.queryByText('ActionButtons');

    expect(publicLink).toBeInTheDocument();
    expect(actionButtons).not.toBeInTheDocument();
  });

  test('should display action buttons in non public mode', () => {
    (useViewData as jest.Mock).mockReturnValue({ loading: false, uuid: mockUuid });
    (useExpiration as jest.Mock).mockReturnValue({
      expirationState: ExpirationState.NotExpired,
      expirationDateFormatted: '2021-01-01',
    });

    render(<ViewCV initialData={{} as ResumeDto} publicMode={false} />);

    const publicLink = screen.queryByText(`PublicLink ${mockOrigin}/cv/${mockUuid}`);
    const actionButtons = screen.getByText('ActionButtons');

    expect(publicLink).not.toBeInTheDocument();
    expect(actionButtons).toBeInTheDocument();
  });

  test('should not display userData-related content if userData is provided', () => {
    (useViewData as jest.Mock).mockReturnValue({ loading: false, uuid: mockUuid, userData: {} });
    (useExpiration as jest.Mock).mockReturnValue({
      expirationState: ExpirationState.NotExpired,
      expirationDateFormatted: '2021-01-01',
    });

    render(<ViewCV initialData={{} as ResumeDto} publicMode={false} />);

    const expiration = screen.queryByText('ExpirationTooltip');
    const nameTitle = screen.queryByText('NameTitle');
    const personalSection = screen.queryByText('PersonalSection');
    const contactsSection = screen.queryByText('ContactsSection');
    const aboutSection = screen.queryByText('AboutSection');
    const coursesSection = screen.queryByText('CoursesSection');
    const feedbackSection = screen.queryByText('FeedbackSection');
    const gratitudeSection = screen.queryByText('GratitudeSection');

    expect(expiration).toBeInTheDocument();
    expect(nameTitle).toBeInTheDocument();
    expect(personalSection).toBeInTheDocument();
    expect(contactsSection).toBeInTheDocument();
    expect(aboutSection).toBeInTheDocument();
    expect(coursesSection).toBeInTheDocument();
    expect(feedbackSection).toBeInTheDocument();
    expect(gratitudeSection).toBeInTheDocument();
  });

  test('should not display userData-related content if userData is not provided', () => {
    (useViewData as jest.Mock).mockReturnValue({ loading: false, uuid: mockUuid, userData: null });
    (useExpiration as jest.Mock).mockReturnValue({
      expirationState: ExpirationState.NotExpired,
      expirationDateFormatted: '2021-01-01',
    });

    render(<ViewCV initialData={{} as ResumeDto} publicMode={false} />);

    const expiration = screen.queryByText('Expiration');
    const nameTitle = screen.queryByText('NameTitle');
    const personalSection = screen.queryByText('PersonalSection');
    const contactsSection = screen.queryByText('ContactsSection');
    const aboutSection = screen.queryByText('AboutSection');
    const coursesSection = screen.queryByText('CoursesSection');
    const feedbackSection = screen.queryByText('FeedbackSection');
    const gratitudeSection = screen.queryByText('GratitudeSection');

    expect(expiration).not.toBeInTheDocument();
    expect(nameTitle).not.toBeInTheDocument();
    expect(personalSection).not.toBeInTheDocument();
    expect(contactsSection).not.toBeInTheDocument();
    expect(aboutSection).not.toBeInTheDocument();
    expect(coursesSection).not.toBeInTheDocument();
    expect(feedbackSection).not.toBeInTheDocument();
    expect(gratitudeSection).not.toBeInTheDocument();
  });
});
