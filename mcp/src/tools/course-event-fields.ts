import { z } from 'zod';

/** Shared course-event payload fields for create/update tools. */
export const courseEventFieldsSchema = {
  dateTime: z.string().max(64).optional().describe('ISO date-time when the event starts'),
  endTime: z.string().max(64).optional().describe('ISO date-time when the event ends'),
  duration: z.number().optional().describe('Duration in minutes'),
  place: z.string().max(500).optional().describe('Place or platform of the event'),
  organizerId: z.number().int().optional().describe('User ID of the organizer'),
  special: z.string().max(500).optional().describe('Special tags, comma-separated'),
  broadcastUrl: z.string().max(2048).optional().describe('Broadcast/stream URL'),
};

export const courseEventFieldsJsonSchemaProperties = {
  dateTime: { type: 'string', description: 'ISO date-time when the event starts' },
  endTime: { type: 'string', description: 'ISO date-time when the event ends' },
  duration: { type: 'number', description: 'Duration in minutes' },
  place: { type: 'string', description: 'Place or platform of the event' },
  organizerId: { type: 'integer', description: 'User ID of the organizer' },
  special: { type: 'string', description: 'Special tags, comma-separated' },
  broadcastUrl: { type: 'string', description: 'Broadcast/stream URL' },
} as const;
