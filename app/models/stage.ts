import { Document, Schema, model } from 'mongoose';

export interface IStage {
    courseId: string;
    title: string;
    startDate: number;
    endDate: number;
}

export interface IStageModel extends Document, IStage {
    _id: string;
}

export const StageSchema: Schema = new Schema({
    courseId: String,
    endDate: Number,
    startDate: Number,
    title: String,
});

export const StageModelName = 'Stage';
export const StageModel = model<IStageModel>(StageModelName, StageSchema);
