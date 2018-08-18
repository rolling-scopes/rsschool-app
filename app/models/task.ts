import { Document, Schema, model } from 'mongoose';

enum TaskType {
    CodeJam = 'Code Jam',
    Task = 'Task',
    Test = 'Test',
    Interview = 'Interview',
}

enum WhoChecks {
    Mentor = 'Mentor',
    RandomMentor = 'Random Mentor',
    Trainer = 'Trainer',
    Duolingo = 'Duolingo',
    Codecademy = 'Codecademy',
    Codewars = 'Codewars',
    WithoutChecking = 'Without Checking',
    ExternalPerson = 'External Person',
    UnitTest = 'Unit Test',
}

export interface ITask {
    title: string;
    type: TaskType;
    startDateTime: number;
    endDateTime: number;
    whoChecks: WhoChecks;
    urlToDescription: string;
    studentCommentTemplate?: string;
    mentorCommentTemplate?: string;
    courseId: string;
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

export const TaskModelName = 'Tasks';
export const TaskModel = model<ITaskModel>(TaskModelName, TaskSchema);
