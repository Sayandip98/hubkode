import mongoose from "mongoose";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_READ_STATUS,
} from "../constants/status.js";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification recipient is required"],
    },

    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification actor is required"],
    },

    type: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: "Invalid notification type",
      },
      required: [true, "Notification type is required"],
    },

    readStatus: {
      type: String,
      enum: Object.values(NOTIFICATION_READ_STATUS),
      default: NOTIFICATION_READ_STATUS.UNREAD,
    },

    resourceType: {
      type: String,
      enum: [
        "Repository",
        "Issue",
        "PullRequest",
        "Commit",
        "Organization",
        "User",
      ],
      required: true,
    },

    resource: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "resourceType",
    },

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
    },

    message: {
      type: String,
      trim: true,
      maxlength: [500, "Notification message cannot exceed 500 characters"],
      default: "",
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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

notificationSchema.index({ recipient: 1, readStatus: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ repository: 1 });

const Notification = model("Notification", notificationSchema);

export default Notification;
