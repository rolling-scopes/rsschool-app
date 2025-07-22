import { useContext } from 'react';
import { MessageContext } from '@client/providers/MessageProvider';

export function useMessage() {
  return useContext(MessageContext);
}
