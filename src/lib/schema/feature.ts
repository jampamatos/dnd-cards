import { z } from "zod";
import { LangString, ActionInfo, SourceInfo } from "./common";

export const Feature = z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: LangString,                       // { pt, en }
    class: z.string(),                      // i.e. "Fighter"
    subclass: z.string().optional(),        // i.e. "Battlemaster"
    level: z.number().min(1).max(20),
    action: ActionInfo.optional(),          // { Action, Bonus Action, Reaction, etc }
    uses: z.string().optional(),            // i.e. "X uses per long or short rest"
    text: LangString,
    tags: z.array(z.string()).default([]),
    source: SourceInfo,
});
export const FeaturesArray = z.array(Feature);
export type TFeature = z.infer<typeof Feature>;