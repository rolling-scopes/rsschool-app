import React, { createContext, useContext } from 'react';
import { DisciplineAction, useDisciplineReducer } from '../reducers/DisciplineReducer';
import { IDiscipline } from '../model';

interface IDisciplineContext {
  disciplines: IDiscipline[];
  dispatch: Dispatch;
}

type Dispatch = (action: DisciplineAction) => void;

const DisciplineContext = createContext<IDisciplineContext>({} as IDisciplineContext);

export const useDisciplineContext = () => {
  return useContext(DisciplineContext);
};

export const DisciplineProvider: React.FC = ({ children }) => {
  const [disciplineState, dispatch] = useDisciplineReducer();
  return (
    <DisciplineContext.Provider value={{ disciplines: disciplineState.disciplines, dispatch }}>
      {children}
    </DisciplineContext.Provider>
  );
};
