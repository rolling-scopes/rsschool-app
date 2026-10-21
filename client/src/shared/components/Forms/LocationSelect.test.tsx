/* eslint-disable testing-library/no-node-access */
// antd renders spinners, alerts and Select options with internal class names and no stable
// role/text hooks, so a few `document.querySelector` calls on `.ant-*` nodes are unavoidable
// here (same convention as the sibling CourseTaskSelect.test.tsx).
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Location } from '@common/models/profile';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { useInterval } from 'ahooks';
import { LocationSelect } from './LocationSelect';

// Boundary mocks: LocationSelect goes through the useGoogleMapsPlaces hook, which wraps
// `use-places-autocomplete` (the Google Maps Places client) and ahooks' `useInterval`
// (the API-load polling). We mock both so we can deterministically control the
// initialized/error/data/value state and drive search, select and blur like a user.
vi.mock('use-places-autocomplete');
vi.mock('ahooks');

const mockSetValue = vi.fn();
const mockInit = vi.fn();
const mockStopPolling = vi.fn();

const usePlacesAutocompleteMock = vi.mocked(usePlacesAutocomplete);
const useIntervalMock = vi.mocked(useInterval);

function mockPlaces(overrides: Partial<ReturnType<typeof usePlacesAutocomplete>> = {}) {
  usePlacesAutocompleteMock.mockReturnValue({
    value: '',
    suggestions: { data: [], loading: false },
    setValue: mockSetValue,
    init: mockInit,
    ...overrides,
  } as ReturnType<typeof usePlacesAutocomplete>);
}

// Capture and expose the polling callback so a test can mark the API as "loaded".
// The returned trigger flushes the hook's state updates inside act() so the
// initialized/error transitions cause a re-render the test can observe.
function setupPolling() {
  let pollCallback: (() => void) | null = null;
  useIntervalMock.mockImplementation((cb: () => void) => {
    pollCallback = cb;
    return mockStopPolling;
  });
  return (times = 1) =>
    act(() => {
      for (let i = 0; i < times; i += 1) {
        pollCallback?.();
      }
    });
}

function renderLocationSelect(props: Partial<Parameters<typeof LocationSelect>[0]> = {}) {
  const onChange = props.onChange ?? vi.fn();
  const utils = render(<LocationSelect location={null} onChange={onChange} {...props} />);
  return { ...utils, onChange };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPlaces();
  useIntervalMock.mockReturnValue(mockStopPolling);
  delete (window as unknown as { google?: unknown }).google;
});

describe('LocationSelect', () => {
  it('shows a loading spinner until the Google Maps API initializes', () => {
    renderLocationSelect();

    // Not initialized yet → a Spin (status role) is shown instead of the combobox.
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders an error alert when the API fails to load', () => {
    const triggerPoll = setupPolling();
    renderLocationSelect();

    // Poll past the timeout without `window.google` ever appearing → hook sets an error.
    triggerPoll(500);

    expect(screen.getByText('Google Maps API is not loaded')).toBeInTheDocument();
    expect(document.querySelector('.ant-alert-error')).toBeInTheDocument();
  });

  it('renders initialized values and the suggestion loading state', () => {
    const triggerPoll = setupPolling();
    (window as unknown as { google: unknown }).google = {};
    const { rerender } = renderLocationSelect();

    triggerPoll();

    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveValue('');

    mockPlaces({ value: 'Prague, Czechia' });
    rerender(<LocationSelect location={null} onChange={vi.fn()} />);
    expect(screen.getByText('Prague, Czechia')).toBeInTheDocument();

    mockPlaces({ value: 'Mi', suggestions: { data: [], loading: true } });
    rerender(<LocationSelect location={null} onChange={vi.fn()} />);
    fireEvent.mouseDown(screen.getByRole('combobox'));

    expect(document.querySelector('.ant-select-dropdown .ant-spin')).toBeInTheDocument();
  });

  it('searches and selects place suggestions', async () => {
    const triggerPoll = setupPolling();
    (window as unknown as { google: unknown }).google = {};
    mockPlaces({
      value: 'M',
      suggestions: { data: [{ description: 'Minsk, Belarus' }, { description: 'Munich, Germany' }], loading: false },
    } as Partial<ReturnType<typeof usePlacesAutocomplete>>);
    const { onChange } = renderLocationSelect();
    triggerPoll();

    const combobox = screen.getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'Min' } });
    await waitFor(() => expect(mockSetValue).toHaveBeenCalledWith('Min'));
    fireEvent.mouseDown(combobox);
    expect(screen.getByRole('option', { name: 'Minsk, Belarus' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Munich, Germany' })).toBeInTheDocument();

    const option = document.querySelector('.ant-select-item-option');
    expect(option).toHaveTextContent('Minsk, Belarus');
    fireEvent.click(option as Element);
    expect(mockSetValue).toHaveBeenCalledWith('Minsk, Belarus', false);
    expect(onChange).toHaveBeenCalledWith({ cityName: 'Minsk', countryName: 'Belarus' } satisfies Location);
  });

  it('restores or retains the location value on blur', () => {
    const triggerPoll = setupPolling();
    (window as unknown as { google: unknown }).google = {};
    mockPlaces({ value: '' });
    const onChange = vi.fn();
    const { rerender } = renderLocationSelect({
      location: { cityName: 'Berlin', countryName: 'Germany' },
      onChange,
    });
    triggerPoll();

    fireEvent.blur(screen.getByRole('combobox'));

    expect(mockSetValue).toHaveBeenCalledWith('Berlin, Germany', false);

    mockSetValue.mockClear();
    rerender(<LocationSelect location={null} onChange={onChange} />);
    fireEvent.blur(screen.getByRole('combobox'));
    expect(mockSetValue).toHaveBeenCalledWith('', false);

    mockPlaces({ value: 'Paris, France' });
    rerender(<LocationSelect location={null} onChange={onChange} />);
    mockSetValue.mockClear();
    fireEvent.blur(screen.getByRole('combobox'));
    expect(mockSetValue).not.toHaveBeenCalled();
  });
});
