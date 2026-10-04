/* eslint-disable testing-library/no-container, testing-library/no-node-access -- antd Spin state is read via container query */
import { render, screen } from '@testing-library/react';

vi.mock('@client/shared/components/Header', () => ({
  Header: () => <header>header</header>,
}));

vi.mock('next/script', () => ({
  default: ({ src }: { src: string }) => <script data-testid="gmaps-script" data-src={src} />,
}));

const { mapsApiKey } = vi.hoisted(() => ({ mapsApiKey: { value: '' as string } }));

vi.mock('@client/configs/gcp', () => ({
  get mapsApiKey() {
    return mapsApiKey.value;
  },
}));

// Import after mocks so the module-level url uses the mocked config.
import { RegistrationPageLayout } from './RegistrationPageLayout';

describe('RegistrationPageLayout', () => {
  beforeEach(() => {
    mapsApiKey.value = 'test-key';
  });

  it('renders content, conditionally loads Maps, and reflects loading state', () => {
    const { container, rerender } = render(
      <RegistrationPageLayout loading={true}>
        <div>registration form</div>
      </RegistrationPageLayout>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('registration form')).toBeInTheDocument();
    expect(screen.getByTestId('gmaps-script')).toBeInTheDocument();
    expect(container.querySelector('.ant-spin-spinning')).toBeInTheDocument();

    mapsApiKey.value = '';
    rerender(
      <RegistrationPageLayout loading={false}>
        <div>content</div>
      </RegistrationPageLayout>,
    );

    expect(screen.queryByTestId('gmaps-script')).not.toBeInTheDocument();
  });
});
