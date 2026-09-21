import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    body: {
      type: String,
      required: [true, "Comment body is required"],
      trim: true,
      maxlength: [65536, "Comment cannot exceed 65536 characters"],
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: [true, "Repository reference is required"],
    },

    parentType: {
      type: String,
      enum: ["Issue", "PullRequest"],
      required: [true, "Parent type is required"],
    },

    parent: {
      type: Schema.Types.ObjectId,
      required: [true, "Parent reference is required"],
      refPath: "parentType",
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    reactions: [
      {
        emoji: {
          type: String,
          required: true,
          enum: [
            "+1",
            "-1",
            "laugh",
            "hooray",
            "confused",
            "heart",
            "rocket",
            "eyes",
          ],
        },
        users: [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

commentSchema.index({ parent: 1, parentType: 1, createdAt: 1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ repository: 1 });

const Comment = model("Comment", commentSchema);

export default Comment;
