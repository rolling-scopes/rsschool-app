import useAlertModal from '@/stores/alert-modal';

const { showAlertModal } = useAlertModal();

export const errorHandler = (error: unknown) => {
  showAlertModal('modal.header.error', `${error}`);
};

export default errorHandler;
