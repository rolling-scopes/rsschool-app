import { IDiscipline } from '../model';
import { ADD_DISCIPLINE, DELETE_DISCIPLINE, LOAD_DISCIPLINES, UPDATE_DISCIPLINE } from './types';
import { useReducer } from 'react';

interface IDisciplineReducerState {
  disciplines: IDiscipline[];
}

export type DisciplineAction = {
  type: string;
  payload: IDiscipline[];
};

const initialState: IDisciplineReducerState = {
  disciplines: [],
};

export const disciplineReducer = (state: IDisciplineReducerState, action: DisciplineAction) => {
  switch (action.type) {
    case LOAD_DISCIPLINES:
      return { ...state, disciplines: action.payload };
    case ADD_DISCIPLINE:
      return { ...state, disciplines: [...state.disciplines, ...action.payload] };
    case UPDATE_DISCIPLINE:
      return {
        ...state,
        disciplines: [
          ...state.disciplines.map(d => {
            if (d.id === action.payload[0].id) d.name = action.payload[0].name;
            return d;
          }),
        ],
      };
    case DELETE_DISCIPLINE:
      return {
        ...state,
        disciplines: [...state.disciplines.filter(d => d.id !== action.payload[0].id)],
      };
    default:
      return state;
  }
};

export const useDisciplineReducer = () => {
  return useReducer(disciplineReducer, initialState);
};
