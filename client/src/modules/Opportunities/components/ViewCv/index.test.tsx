import { render, screen } from '@testing-library/react';
import { ResumeDto } from '@client/api';
import { ExpirationState } from '@client/modules/Opportunities/constants';
import { useViewData, useExpiration } from '@client/modules/Opportunities/hooks';
import { ViewCV } from './index';

vi.mock('@client/modules/Opportunities/components/ExpirationTooltip', () => ({
  ExpirationTooltip: () => <div>ExpirationTooltip</div>,
}));

vi.mock('./AboutSection', () => ({
  AboutSection: () => <div>AboutSection</div>,
}));

vi.mock('./ContactsSection', () => ({
  ContactsSection: () => <div>ContactsSection</div>,
}));

vi.mock('./CoursesSection', () => ({
  CoursesSection: () => <div>CoursesSection</div>,
}));

vi.mock('./FeedbackSection', () => ({
  FeedbackSection: () => <div>FeedbackSection</div>,
}));

vi.mock('./GratitudeSection', () => ({
  GratitudeSection: () => <div>GratitudeSection</div>,
}));

vi.mock('./PersonalSection', () => ({
  PersonalSection: () => <div>PersonalSection</div>,
}));

vi.mock('../NameTitle', () => ({
  NameTitle: () => <div>NameTitle</div>,
}));

vi.mock('../PublicLink', () => ({
  PublicLink: ({ url }: { url: string }) => <div>PublicLink {url}</div>,
}));

vi.mock('./ActionButtons', () => ({
  ActionButtons: () => <div>ActionButtons</div>,
}));

vi.mock('@client/modules/Opportunities/hooks');

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

const mockUuid = '13791ec3-83b9-44ce-95c5-f06837a71966';

describe('ViewCV', () => {
  test('should render loading, public, private, populated, and empty data states', () => {
    vi.mocked(useViewData).mockReturnValue({ loading: true });
    vi.mocked(useExpiration).mockReturnValue({
      expirationState: ExpirationState.NotExpired,
      expirationDateFormatted: '2021-01-01',
    });

    const { rerender } = render(<ViewCV initialData={{} as ResumeDto} />);

    const loadingScreen = screen.getByText('Loading...');

    expect(loadingScreen).toBeInTheDocument();

    vi.mocked(useViewData).mockReturnValue({ loading: false, uuid: mockUuid });
    rerender(<ViewCV initialData={{} as ResumeDto} publicMode={true} />);

    expect(screen.getByText(`PublicLink ${window.location.origin}/cv/${mockUuid}`)).toBeInTheDocument();
    expect(screen.queryByText('ActionButtons')).not.toBeInTheDocument();

    rerender(<ViewCV initialData={{} as ResumeDto} publicMode={false} />);

    expect(screen.queryByText(`PublicLink ${window.location.origin}/cv/${mockUuid}`)).not.toBeInTheDocument();
    expect(screen.getByText('ActionButtons')).toBeInTheDocument();

    vi.mocked(useViewData).mockReturnValue({ loading: false, uuid: mockUuid, userData: {} });
    rerender(<ViewCV initialData={{} as ResumeDto} publicMode={false} />);

    expect(screen.getByText('ExpirationTooltip')).toBeInTheDocument();
    expect(screen.getByText('NameTitle')).toBeInTheDocument();
    expect(screen.getByText('PersonalSection')).toBeInTheDocument();
    expect(screen.getByText('ContactsSection')).toBeInTheDocument();
    expect(screen.getByText('AboutSection')).toBeInTheDocument();
    expect(screen.getByText('CoursesSection')).toBeInTheDocument();
    expect(screen.getByText('FeedbackSection')).toBeInTheDocument();
    expect(screen.getByText('GratitudeSection')).toBeInTheDocument();

    vi.mocked(useViewData).mockReturnValue({ loading: false, uuid: mockUuid, userData: null });
    rerender(<ViewCV initialData={{} as ResumeDto} publicMode={false} />);

    expect(screen.queryByText('Expiration')).not.toBeInTheDocument();
    expect(screen.queryByText('NameTitle')).not.toBeInTheDocument();
    expect(screen.queryByText('PersonalSection')).not.toBeInTheDocument();
    expect(screen.queryByText('ContactsSection')).not.toBeInTheDocument();
    expect(screen.queryByText('AboutSection')).not.toBeInTheDocument();
    expect(screen.queryByText('CoursesSection')).not.toBeInTheDocument();
    expect(screen.queryByText('FeedbackSection')).not.toBeInTheDocument();
    expect(screen.queryByText('GratitudeSection')).not.toBeInTheDocument();
  });
});
