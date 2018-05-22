import { Document, Schema, model } from 'mongoose';

export interface IEventVenue {
    name: string;
    id: string;
}

export interface IEvent {
    id: string;
    courseId: string;
    description: string;
    endDateTime: number;
    name: string;
    startDateTime: number;
    venue: IEventVenue;
}

export interface IEventModel extends Document, IEvent {
    id: string;
}

export const EventVenueSchema: Schema = new Schema({
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
    startDateTime: Number,
    venue: EventVenueSchema,
});

export const EventModelName = 'Event';
export const EventDocument = model<IEventModel>(EventModelName, EventSchema);
