import { getRepository } from 'typeorm';
import { Discipline } from '../models';

type data = {
  name: string;
};

export const postDisciplineRepository = async (data: data) => {
  const repository = getRepository(Discipline);
  const discipline = await repository.save(data);
  return discipline;
};

export const updateDisciplineRepository = async (id: number, data: data) => {
  const repository = getRepository(Discipline);
  const discipline = await repository.findOne(id);
  const disciplineForSave = { ...discipline, ...data };
  const saved = await repository.save(disciplineForSave);
  return saved;
};

export const deleteDisciplineRepository = async (id: number) => {
  const repository = getRepository(Discipline);
  const discipline = await repository.findOne(id);
  await repository.delete(id);
  return discipline;
};
