import { z } from "zod";
import { LangString, ActionInfo, SourceInfo } from "./common.js";

export const Spell = z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: LangString,
    level: z.number().int().min(0).max(9),
    school: LangString,
    classes: z.array(z.string()),
    castingTime: ActionInfo,
    range: LangString,
    duration: LangString,
    concentration: z.boolean().default(false),
    ritual: z.boolean().default(false),
    components: z.object({
        verbal: z.boolean().default(false),
        somatic: z.boolean().default(false),
        material: z.string().min(1).optional(),
    }),
    text: LangString,
    tags: z.array(z.string()).default([]),
    source: SourceInfo,
});

export type TSpell = z.infer<typeof Spell>;
export const SpellsArray = z.array(Spell);