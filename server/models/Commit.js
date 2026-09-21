import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commitFileSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["added", "modified", "deleted", "renamed"],
      required: true,
    },
    additions: {
      type: Number,
      default: 0,
    },
    deletions: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const commitSchema = new Schema(
  {
    sha: {
      type: String,
      required: [true, "Commit SHA is required"],
      unique: true,
      trim: true,
    },

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: [true, "Repository reference is required"],
    },

    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch reference is required"],
    },

    message: {
      type: String,
      required: [true, "Commit message is required"],
      trim: true,
      maxlength: [2000, "Commit message cannot exceed 2000 characters"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    author: {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      date: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },

    committer: {
      name: {
        type: String,
        trim: true,
        default: "",
      },
      email: {
        type: String,
        trim: true,
        default: "",
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },

    parents: [
      {
        type: String,
        trim: true,
      },
    ],

    tree: {
      type: String,
      trim: true,
      default: "",
    },

    files: [commitFileSchema],

    stats: {
      additions: {
        type: Number,
        default: 0,
      },
      deletions: {
        type: Number,
        default: 0,
      },
      filesChanged: {
        type: Number,
        default: 0,
      },
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

commitSchema.index({ repository: 1, branch: 1, createdAt: -1 });
commitSchema.index({ repository: 1, "author.user": 1 });
commitSchema.index({ repository: 1, createdAt: -1 });

const Commit = model("Commit", commitSchema);

export default Commit;
