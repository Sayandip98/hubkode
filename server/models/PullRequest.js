import mongoose from "mongoose";
import { PR_STATUS, REVIEW_STATE } from "../constants/status.js";

const { Schema, model } = mongoose;

const reviewCommentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: [65536, "Review comment cannot exceed 65536 characters"],
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    line: {
      type: Number,
      default: null,
    },
    side: {
      type: String,
      enum: ["LEFT", "RIGHT"],
      default: "RIGHT",
    },
    commitSha: {
      type: String,
      trim: true,
      default: "",
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const reviewSchema = new Schema(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    state: {
      type: String,
      enum: {
        values: Object.values(REVIEW_STATE),
        message: "Invalid review state",
      },
      default: REVIEW_STATE.PENDING,
    },
    body: {
      type: String,
      trim: true,
      default: "",
      maxlength: [65536, "Review body cannot exceed 65536 characters"],
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    comments: [reviewCommentSchema],
  },
  { timestamps: true },
);

const pullRequestSchema = new Schema(
  {
    number: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: [true, "Pull request title is required"],
      trim: true,
      maxlength: [500, "Pull request title cannot exceed 500 characters"],
    },

    body: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: Object.values(PR_STATUS),
        message: "Invalid pull request status",
      },
      default: PR_STATUS.OPEN,
    },

    isDraft: {
      type: Boolean,
      default: false,
    },

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: [true, "Repository reference is required"],
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pull request author is required"],
    },

    sourceBranch: {
      type: String,
      required: [true, "Source branch is required"],
      trim: true,
    },

    targetBranch: {
      type: String,
      required: [true, "Target branch is required"],
      trim: true,
    },

    sourceRepository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
    },

    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    requestedReviewers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reviews: [reviewSchema],

    labels: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: 50,
        },
        color: {
          type: String,
          required: true,
          match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"],
          default: "#0075ca",
        },
        description: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commitsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    additions: {
      type: Number,
      default: 0,
      min: 0,
    },

    deletions: {
      type: Number,
      default: 0,
      min: 0,
    },

    changedFiles: {
      type: Number,
      default: 0,
      min: 0,
    },

    mergedAt: {
      type: Date,
      default: null,
    },

    mergedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    mergeCommitSha: {
      type: String,
      trim: true,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    closedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    linkedIssues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],

    headCommitSha: {
      type: String,
      trim: true,
      default: "",
    },

    baseCommitSha: {
      type: String,
      trim: true,
      default: "",
    },

    isMergeable: {
      type: Boolean,
      default: true,
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

pullRequestSchema.index({ repository: 1, number: 1 }, { unique: true });
pullRequestSchema.index({ repository: 1, status: 1, createdAt: -1 });
pullRequestSchema.index({ repository: 1, author: 1 });
pullRequestSchema.index({ repository: 1, sourceBranch: 1, targetBranch: 1 });
pullRequestSchema.index({ repository: 1, assignees: 1 });
pullRequestSchema.index({ repository: 1, requestedReviewers: 1 });
pullRequestSchema.index(
  { title: "text", body: "text" },
  { weights: { title: 10, body: 1 } },
);

pullRequestSchema.virtual("reviewSummary").get(function () {
  const summary = {
    approved: 0,
    changesRequested: 0,
    commented: 0,
    pending: 0,
    dismissed: 0,
  };

  this.reviews.forEach((review) => {
    switch (review.state) {
      case REVIEW_STATE.APPROVED:
        summary.approved++;
        break;
      case REVIEW_STATE.CHANGES_REQUESTED:
        summary.changesRequested++;
        break;
      case REVIEW_STATE.COMMENTED:
        summary.commented++;
        break;
      case REVIEW_STATE.PENDING:
        summary.pending++;
        break;
      case REVIEW_STATE.DISMISSED:
        summary.dismissed++;
        break;
    }
  });

  return summary;
});

pullRequestSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastPR = await this.constructor
      .findOne({ repository: this.repository })
      .sort({ number: -1 })
      .select("number");

    this.number = lastPR ? lastPR.number + 1 : 1;
  }
  next();
});

const PullRequest = model("PullRequest", pullRequestSchema);

export default PullRequest;
