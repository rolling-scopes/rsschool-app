import { screen, render, fireEvent } from '@testing-library/react';
import { Notification } from '.';
import { INFO_MESSAGE } from 'modules/Mentor/constants';
import * as ReactUse from 'react-use';

describe('Notification', () => {
  it('should render alert', () => {
    render(<Notification />);

    expect(screen.getByText(INFO_MESSAGE)).toBeInTheDocument();
  });

  it('should not render alert when it was hide previously', () => {
    jest.spyOn(ReactUse, 'useLocalStorage').mockReturnValueOnce([false, jest.fn(), jest.fn()]);
    render(<Notification />);

    expect(screen.queryByText(INFO_MESSAGE)).not.toBeInTheDocument();
  });

  it('should hide alert when close icon was clicked', () => {
    const setIsShowMock = jest.fn();
    jest.spyOn(ReactUse, 'useLocalStorage').mockReturnValueOnce([true, setIsShowMock, jest.fn()]);
    render(<Notification />);

    const closeIcon = screen.getByRole('img', { name: 'close' });
    fireEvent.click(closeIcon);

    expect(setIsShowMock).toHaveBeenCalledWith(false);
  });
});
