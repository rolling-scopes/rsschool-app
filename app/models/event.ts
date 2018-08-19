import { Document, Schema, model } from 'mongoose';

enum EventType {
    Lecture = 'lecture',
    Task = 'task',
}

enum SessionType {
    Online = 'Online',
    Offline = 'Offline',
    SelfLearning = 'Self-learning',
    ExtraEvent = 'Extra Event',
}

enum TaskType {
    Task = 'Task',
    CodeJam = 'Code Jam',
    Interview = 'Interview',
    Test = 'Test',
}

enum WhoChecks {
    Mentor = 'Mentor',
    RandomMentor = 'Random Mentor',
    Trainer = 'Trainer',
    UnitTest = 'Unit Test',
    ExternalPerson = 'External Person',
    WithoutChecking = 'Without Checking',
    Codewars = 'Codewars',
    Codecademy = 'Codecademy',
    Duolingo = 'Duolingo',
}

export interface IEvent {
    courseId: string;
    endDateTime?: number;
    location?: string;
    urlToDescription?: string;
    startDateTime: number;
    sessionType?: SessionType;
    trainer?: string;
    type: EventType;
    title: string;
    taskType?: TaskType;
    whoChecks?: WhoChecks;
}

export interface IEventModel extends Document, IEvent {
    _id: string;
}

export const EventSchema: Schema = new Schema({
    courseId: String,
    endDateTime: Number,
    location: String,
    sessionType: String,
    startDateTime: Number,
    taskType: String,
    title: String,
    trainer: String,
    type: String,
    urlToDescription: String,
    whoChecks: String,
});

export const LectureModelName = 'Lecture';
export const LectureModel = model<IEventModel>(LectureModelName, EventSchema);

export const TaskModelName = 'Task';
export const TaskModel = model<IEventModel>(TaskModelName, EventSchema);
