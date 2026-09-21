import mongoose from "mongoose";
import { ORG_ROLES } from "../constants/roles.js";

const { Schema, model } = mongoose;

const memberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ORG_ROLES),
        message: "Invalid organization role",
      },
      default: ORG_ROLES.MEMBER,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Organization name must be at least 3 characters"],
      maxlength: [39, "Organization name cannot exceed 39 characters"],
      match: [
        /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
        "Organization name can only contain alphanumeric characters and hyphens",
      ],
    },

    displayName: {
      type: String,
      trim: true,
      maxlength: [100, "Display name cannot exceed 100 characters"],
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    avatarUrl: {
      type: String,
      default: "",
    },

    avatarPublicId: {
      type: String,
      default: "",
      select: false,
    },

    website: {
      type: String,
      trim: true,
      maxlength: [255, "Website URL cannot exceed 255 characters"],
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [
        /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    members: [memberSchema],

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
        delete ret.avatarPublicId;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

organizationSchema.index({ "members.user": 1 });
organizationSchema.index({ createdBy: 1 });
organizationSchema.index(
  { name: "text", displayName: "text", description: "text" },
  { weights: { name: 10, displayName: 5, description: 1 } },
);

organizationSchema.virtual("membersCount").get(function () {
  return this.members?.length ?? 0;
});

organizationSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString(),
  );
  return member ? member.role : null;
};

organizationSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

organizationSchema.methods.isOwner = function (userId) {
  return this.members.some(
    (m) =>
      m.user.toString() === userId.toString() && m.role === ORG_ROLES.OWNER,
  );
};

const Organization = model("Organization", organizationSchema);

export default Organization;
