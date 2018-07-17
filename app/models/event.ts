import { Document, Schema, model } from 'mongoose';

enum EventType {
    Session = 'session',
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
    descriptionFileUrl?: string;
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
    descriptionFileUrl: String,
    endDateTime: Number,
    location: String,
    sessionType: String,
    startDateTime: Number,
    taskType: String,
    title: String,
    trainer: String,
    type: String,
    whoChecks: String,
});

export const EventModelName = 'Event';
export const EventModel = model<IEventModel>(EventModelName, EventSchema);
