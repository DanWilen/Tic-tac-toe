import { z } from "zod";

// Zod schemas
export const joinSchema = z.object({ gameId: z.uuid() });

export const moveSchema = z.object({
	gameId: z.uuid(),
	row: z.number().int().min(0).max(2),
	col: z.number().int().min(0).max(2),
});

export enum SchemaCallbackError { INVALID = 'Invalid input format' }
