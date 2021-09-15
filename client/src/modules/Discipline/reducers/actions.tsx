import { IDiscipline } from '../model';
import { ADD_DISCIPLINE, DELETE_DISCIPLINE, LOAD_DISCIPLINES, UPDATE_DISCIPLINE } from './types';
import { DisciplineAction } from './DisciplineReducer';

type Dispatch = (action: DisciplineAction) => void;

export const loadAllDisciplines = (dispatch: Dispatch, disciplines: IDiscipline[]) => {
  dispatch({
    type: LOAD_DISCIPLINES,
    payload: disciplines,
  });
};

export const addDiscipline = (dispatch: Dispatch, discipline: IDiscipline[]) => {
  dispatch({
    type: ADD_DISCIPLINE,
    payload: discipline,
  });
};

export const updateDiscipline = (dispatch: Dispatch, discipline: IDiscipline[]) => {
  dispatch({
    type: UPDATE_DISCIPLINE,
    payload: discipline,
  });
};

export const deleteDiscipline = (dispatch: Dispatch, discipline: IDiscipline[]) => {
  dispatch({
    type: DELETE_DISCIPLINE,
    payload: discipline,
  });
};
