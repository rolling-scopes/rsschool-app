import { Document, Schema, model } from 'mongoose';

export interface IEventVenue {
    name: string;
    id: string;
}

export interface IEventTag {
    name: string;
    id: string;
}

export interface IEventSpeaker {
    name: string;
    id: string;
}

export interface IEvent {
    courseId: string;
    description: string;
    endDateTime: number;
    id: string;
    name: string;
    speakers: IEventSpeaker[];
    stage: string;
    startDateTime: number;
    tags: IEventTag[];
    venue: IEventVenue;
}

export interface IEventModel extends Document, IEvent {
    id: string;
}

export const EventVenueSchema: Schema = new Schema({
    name: String,
});

export const EventSpeakerSchema: Schema = new Schema({
    name: String,
});

export const EventTagSchema: Schema = new Schema({
    name: String,
});

export const EventSchema: Schema = new Schema({
    courseId: String,
    description: String,
    endDateTime: Number,
    name: {
        required: true,
        type: String,
    },
    speakers: [EventSpeakerSchema],
    stage: String,
    startDateTime: Number,
    tags: [EventTagSchema],
    venue: EventVenueSchema,
});

export const EventModelName = 'Event';
export const EventDocument = model<IEventModel>(EventModelName, EventSchema);
