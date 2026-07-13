import z from "zod";
import { ReactionType } from "../../../common/enums/enum.js";

export const CreateReactionDtoSchema = z.object({
  reactionType: z.nativeEnum(ReactionType),
});

export type CreateReactionDto = z.infer<typeof CreateReactionDtoSchema>;
