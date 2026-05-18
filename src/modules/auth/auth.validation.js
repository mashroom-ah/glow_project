const { z } = require('zod');

const registerSchema = z.object({
    email: z.email(),

    password: z
        .string()
        .min(6),

    name: z
        .string()
        .min(2),

    city: z
        .string()
        .min(2),

    height: z
        .number()
        .positive(),

    weight: z
        .number()
        .positive(),

    birth_date: z.string(),

    activity_level: z.enum([
        'low',
        'medium',
        'high',
    ]),
});

const loginSchema = z.object({
    email: z.email(),

    password: z.string(),
});

module.exports = {
    registerSchema,
    loginSchema,
};