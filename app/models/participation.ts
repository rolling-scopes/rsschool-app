import { Document, Schema, model } from 'mongoose';
import { FeedRecordScheme } from './feed';

export interface IParticipation {
    courseId: string;
    excludeReason: string | undefined;
    isActive: boolean;
    persons: Array<{ id: string }>;
    role: 'mentor' | 'student';
    userId: string;
}

export interface IParticipationModel extends IParticipation, Document {
    _id: string;
}

export const ParticipationScheme: Schema = new Schema({
    courseId: String,
    excludeReason: { type: String, default: undefined },
    feed: {
        default: [],
        type: [FeedRecordScheme],
    },
    isActive: { type: Boolean, default: true },
    persons: [{ id: { type: String, default: '' } }],
    role: { type: String, default: '' },
    userId: String,
});

export const ParticipationModelName = 'Participation';
export const ParticipationDocument = model<IParticipationModel>(ParticipationModelName, ParticipationScheme);
