import { useState } from 'react';
import { useAsync } from 'react-use';
import { EventsApi, DisciplinesApi, EventDto, DisciplineDto } from '@client/api';

const eventsApi = new EventsApi();
const disciplinesApi = new DisciplinesApi();

export function useEvents() {
  const [data, setData] = useState<EventDto[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);

  const loadData = async () => {
    const [{ data: events }, { data: disciplines }] = await Promise.all([
      eventsApi.getEvents(),
      disciplinesApi.getDisciplines(),
    ]);
    setData(events);
    setDisciplines(disciplines || []);
  };

  const { loading } = useAsync(loadData, []);

  const createEvent = async (values: any) => {
    await eventsApi.createEvent(values);
    await loadData();
  };

  const updateEvent = async (id: number, values: any) => {
    await eventsApi.updateEvent(id, values);
    await loadData();
  };

  const deleteEvent = async (id: number) => {
    await eventsApi.deleteEvent(id);
    await loadData();
  };

  return { data, disciplines, loading, createEvent, updateEvent, deleteEvent };
}
