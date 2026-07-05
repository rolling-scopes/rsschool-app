import { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { message, notification } from 'antd';
import { MessageContext, MessageProvider } from './MessageProvider';

describe('MessageProvider', () => {
  function Consumer() {
    const ctx = useContext(MessageContext);
    return (
      <div>
        <span data-testid="has-message">{String(typeof ctx.message?.success === 'function')}</span>
        <span data-testid="has-notification">{String(typeof ctx.notification?.success === 'function')}</span>
      </div>
    );
  }

  it('provides message and notification instances from the antd hooks', () => {
    render(
      <MessageProvider>
        <Consumer />
      </MessageProvider>,
    );

    expect(screen.getByTestId('has-message')).toHaveTextContent('true');
    expect(screen.getByTestId('has-notification')).toHaveTextContent('true');
  });

  it('renders its children', () => {
    render(
      <MessageProvider>
        <div>child-content</div>
      </MessageProvider>,
    );

    expect(screen.getByText('child-content')).toBeInTheDocument();
  });

  it('the provided instances come from the hook APIs (not the static antd singletons)', () => {
    const spyMessage = vi.spyOn(message, 'useMessage');
    const spyNotification = vi.spyOn(notification, 'useNotification');

    render(
      <MessageProvider>
        <div>child</div>
      </MessageProvider>,
    );

    expect(spyMessage).toHaveBeenCalled();
    expect(spyNotification).toHaveBeenCalled();

    spyMessage.mockRestore();
    spyNotification.mockRestore();
  });
});
