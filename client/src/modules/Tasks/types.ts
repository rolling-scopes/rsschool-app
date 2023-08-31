import { TaskDto } from 'api';

type ModalData = (Partial<Omit<TaskDto, 'attributes'>> & { attributes?: string }) | null;

export type { ModalData };
