import z from "zod";
export const CreatePostDtoSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});
export type CreatePostDto = z.infer<typeof CreatePostDtoSchema>;