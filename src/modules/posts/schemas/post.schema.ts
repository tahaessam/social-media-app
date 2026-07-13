import { Schema } from "mongoose";

export const postSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		title: { type: String },
		content: { type: String, required: true },
		attachments: { type: [String], default: [] },
		commentscount: { type: Number, default: 0 },
		sharecount: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

export default postSchema;
