import mongoose from "mongoose";
import { ISSUE_STATUS } from "../constants/status.js";

const { Schema, model } = mongoose;

const labelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Label name cannot exceed 50 characters"],
    },
    color: {
      type: String,
      required: true,
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code"],
      default: "#0075ca",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Label description cannot exceed 200 characters"],
      default: "",
    },
  },
  { _id: true },
);

const issueSchema = new Schema(
  {
    number: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      maxlength: [500, "Issue title cannot exceed 500 characters"],
    },

    body: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: Object.values(ISSUE_STATUS),
        message: "Invalid issue status",
      },
      default: ISSUE_STATUS.OPEN,
    },

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: [true, "Repository reference is required"],
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Issue author is required"],
    },

    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    labels: [labelSchema],

    closedAt: {
      type: Date,
      default: null,
    },

    closedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    linkedPullRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "PullRequest",
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

issueSchema.index({ repository: 1, number: 1 }, { unique: true });
issueSchema.index({ repository: 1, status: 1, createdAt: -1 });
issueSchema.index({ repository: 1, author: 1 });
issueSchema.index({ repository: 1, assignees: 1 });
issueSchema.index({ repository: 1, "labels.name": 1 });
issueSchema.index(
  { title: "text", body: "text" },
  { weights: { title: 10, body: 1 } },
);

issueSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastIssue = await this.constructor
      .findOne({ repository: this.repository })
      .sort({ number: -1 })
      .select("number");

    this.number = lastIssue ? lastIssue.number + 1 : 1;
  }
  next();
});

const Issue = model("Issue", issueSchema);

export default Issue;
