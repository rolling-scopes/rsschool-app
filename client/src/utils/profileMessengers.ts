import { message } from 'antd';

const onSaveSuccess = (text?: string) => message.success(text ?? 'Profile was successfully saved');
const onSaveError = (text?: string) =>
  message.error(text ?? 'Error has occurred. Please check your connection and try again');

export { onSaveError, onSaveSuccess };
