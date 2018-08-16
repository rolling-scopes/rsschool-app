import { Document, Schema, model } from 'mongoose';

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

export interface ITask {
    author: string;
    courseId: string;
    endDateTime: number;
    mentorCommentTemplate?: string;
    startDateTime: number;
    studentCommentTemplate?: string;
    taskType: TaskType;
    title: string;
    type: string;
    urlToDescription: string;
    whoChecks: WhoChecks;
}

export interface ITaskModel extends Document, ITask {
    _id: string;
}

export const TaskSchema: Schema = new Schema({
    author: String,
    courseId: String,
    endDateTime: Number,
    mentorCommentTemplate: String,
    startDateTime: Number,
    studentCommentTemplate: String,
    taskType: String,
    title: String,
    type: String,
    urlToDescription: String,
    whoChecks: String,
});

export const TaskModelName = 'Task';
export const TaskModel = model<ITaskModel>(TaskModelName, TaskSchema);
