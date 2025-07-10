import { message, notification } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { NotificationInstance } from 'antd/es/notification/interface';
import { createContext, ReactNode } from 'react';

type MessageProvider = {
  message: MessageInstance;
  notification: NotificationInstance;
};

const MessageContext = createContext<MessageProvider>({
  message,
  notification,
});

function MessageProvider({ children }: { children: ReactNode }) {
  const [messageApi, messageContext] = message.useMessage();
  const [notificationApi, notificationContext] = notification.useNotification();
  return (
    <MessageContext.Provider
      value={{
        message: messageApi,
        notification: notificationApi,
      }}
    >
      {messageContext}
      {notificationContext}
      {children}
    </MessageContext.Provider>
  );
}

export { MessageContext, MessageProvider };
