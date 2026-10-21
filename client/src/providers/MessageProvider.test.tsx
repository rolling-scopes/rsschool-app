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

  it('provides hook instances and renders children', () => {
    const spyMessage = vi.spyOn(message, 'useMessage');
    const spyNotification = vi.spyOn(notification, 'useNotification');

    render(
      <MessageProvider>
        <Consumer />
        <div>child-content</div>
      </MessageProvider>,
    );

    expect(screen.getByTestId('has-message')).toHaveTextContent('true');
    expect(screen.getByTestId('has-notification')).toHaveTextContent('true');
    expect(screen.getByText('child-content')).toBeInTheDocument();
    expect(spyMessage).toHaveBeenCalled();
    expect(spyNotification).toHaveBeenCalled();

    spyMessage.mockRestore();
    spyNotification.mockRestore();
  });
});
