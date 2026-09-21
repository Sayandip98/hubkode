import mongoose from "mongoose";

const { Schema, model } = mongoose;

const branchSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
      maxlength: [255, "Branch name cannot exceed 255 characters"],
      match: [/^[a-zA-Z0-9._/-]+$/, "Branch name contains invalid characters"],
    },

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: [true, "Repository reference is required"],
    },

    latestCommit: {
      type: Schema.Types.ObjectId,
      ref: "Commit",
      default: null,
    },

    latestCommitSha: {
      type: String,
      default: "",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isProtected: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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

branchSchema.index({ repository: 1, name: 1 }, { unique: true });
branchSchema.index({ repository: 1, isDefault: 1 });

const Branch = model("Branch", branchSchema);

export default Branch;
