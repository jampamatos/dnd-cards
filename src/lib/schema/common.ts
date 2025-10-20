import { z } from "zod";

const NonEmpty = z.string().min(1);

export const LangString = z.object({
    pt: NonEmpty,
    en: NonEmpty,
});

export const ActionInfo = LangString;           // alias without duplication

export const SourceInfo = z.object({
    name: z.string(),                           // "SRD 5.1" or "Imported"
    license: z.string().optional(),             // "Open Gaming License v1.0a"
    page: z.number().int().min(1).optional(),   // page number in the source
});

export type TLangString = z.infer<typeof LangString>;