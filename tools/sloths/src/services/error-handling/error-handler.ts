import useAlertModal from '@/stores/alert-modal';
import { APIError } from './api-error';
import { CustomError } from './custom-error';

const { showAlertModal } = useAlertModal();

export const errorHandler = (error: unknown) => {
  if (error instanceof APIError) {
    const messageDetail = error.requestError.message;

    const messageForUser = Array.isArray(messageDetail) ? messageDetail.join('\r\n- ') : messageDetail;
    showAlertModal(
      'modal.header.error',
      `API Error (Code ${error.statusCode}): ${error.message}\r\n \r\n- ${messageForUser}`
    );
  } else if (error instanceof CustomError) {
    showAlertModal('modal.header.error', `ErrorCode (${error.customCode}): ${error.message}`);
  } else {
    // todo ? showAlertModal('modal.header.error', `${error}`);
  }
};

export default errorHandler;
