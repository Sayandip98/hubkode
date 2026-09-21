import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * Collaborator Sub-Schema
 *
 * Represents a user who has been explicitly granted access
 * to a repository they do not own.
 */
const collaboratorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permission: {
      type: String,
      enum: {
        values: ["read", "write", "admin"],
        message: "Permission must be read, write, or admin",
      },
      default: "read",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

/**
 * Repository Schema
 *
 * Core entity for all code-hosting functionality.
 *
 * Ownership model:
 *   - ownerType "User"         → personal repository
 *   - ownerType "Organization" → organization repository
 *
 * Access model:
 *   - isPrivate: false → anyone can read
 *   - isPrivate: true  → only owner + collaborators with read+ can access
 *
 * Git data (branches, commits, files) is managed by isomorphic-git
 * and stored on the filesystem in Phase 5. This schema stores
 * metadata only — not the actual git objects.
 */
const repositorySchema = new Schema(
  {
    // --------------------------------------------------
    // IDENTITY
    // --------------------------------------------------

    name: {
      type: String,
      required: [true, "Repository name is required"],
      trim: true,
      minlength: [1, "Repository name cannot be empty"],
      maxlength: [100, "Repository name cannot exceed 100 characters"],
      match: [
        /^[a-zA-Z0-9_.-]+$/,
        "Repository name can only contain alphanumeric characters, hyphens, underscores, and dots",
      ],
    },

    /**
     * fullName — "username/repo-name" or "orgname/repo-name"
     * Unique identifier used in URLs: /api/v1/repositories/:owner/:repoName
     * Computed and stored on creation for fast lookup.
     */
    fullName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    // --------------------------------------------------
    // OWNERSHIP (polymorphic — User or Organization)
    // --------------------------------------------------

    owner: {
      type: Schema.Types.ObjectId,
      required: [true, "Repository owner is required"],
      refPath: "ownerType",
    },

    ownerType: {
      type: String,
      required: true,
      enum: {
        values: ["User", "Organization"],
        message: "Owner type must be User or Organization",
      },
    },

    // --------------------------------------------------
    // VISIBILITY AND ACCESS
    // --------------------------------------------------

    isPrivate: {
      type: Boolean,
      default: false,
    },

    /**
     * Collaborators — users explicitly granted access.
     * Does not include the owner (owner always has admin access).
     */
    collaborators: [collaboratorSchema],

    // --------------------------------------------------
    // GIT METADATA
    // --------------------------------------------------

    /**
     * defaultBranch — name of the default branch (e.g. "main").
     * Updated when the user changes the default branch in settings.
     * Actual branch data lives in the Branch model and git filesystem.
     */
    defaultBranch: {
      type: String,
      default: "main",
      trim: true,
    },

    /**
     * isInitialized — false until the first commit is pushed.
     * An uninitialized repo shows the setup/clone instructions page.
     */
    isInitialized: {
      type: Boolean,
      default: false,
    },

    // --------------------------------------------------
    // REPOSITORY SETTINGS
    // --------------------------------------------------

    website: {
      type: String,
      trim: true,
      maxlength: [255, "Website URL cannot exceed 255 characters"],
      default: "",
    },

    topics: {
      type: [String],
      default: [],
      validate: {
        validator: function (topics) {
          return topics.length <= 20;
        },
        message: "A repository cannot have more than 20 topics",
      },
    },

    language: {
      type: String,
      trim: true,
      maxlength: [50, "Language name cannot exceed 50 characters"],
      default: "",
    },

    // --------------------------------------------------
    // FEATURES (can be disabled per repository)
    // --------------------------------------------------

    hasIssues: {
      type: Boolean,
      default: true,
    },

    hasWiki: {
      type: Boolean,
      default: true,
    },

    hasDiscussions: {
      type: Boolean,
      default: false,
    },

    // --------------------------------------------------
    // SOCIAL
    // --------------------------------------------------

    stars: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    watchers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /**
     * forkedFrom — reference to the parent repository if this is a fork.
     * null for original repositories.
     */
    forkedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
    },

    forkCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --------------------------------------------------
    // ACTIVITY METADATA
    // --------------------------------------------------

    /**
     * lastPushedAt — updated on every commit push.
     * Used for sorting repositories by recent activity.
     */
    lastPushedAt: {
      type: Date,
      default: null,
    },

    openIssuesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    openPullRequestsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --------------------------------------------------
    // ARCHIVE
    // --------------------------------------------------

    isArchived: {
      type: Boolean,
      default: false,
    },

    archivedAt: {
      type: Date,
      default: null,
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

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

// Primary lookup — owner + name combination must be unique per owner
repositorySchema.index({ owner: 1, name: 1 }, { unique: true });

// fullName is already unique via the field definition
// Mongoose creates this index automatically

// Used for filtering repositories by owner (e.g. user profile page)
repositorySchema.index({ owner: 1, isPrivate: 1, createdAt: -1 });

// Used for explore/trending — sort by stars count
repositorySchema.index({ stars: 1 });

// Used for filtering by topic
repositorySchema.index({ topics: 1 });

// Used for sorting by recent activity
repositorySchema.index({ lastPushedAt: -1 });

// Full-text search across name, description, and topics
repositorySchema.index(
  { name: "text", description: "text", topics: "text" },
  { weights: { name: 10, topics: 5, description: 1 } },
);

// --------------------------------------------------
// VIRTUALS
// --------------------------------------------------

repositorySchema.virtual("starsCount").get(function () {
  return this.stars?.length ?? 0;
});

repositorySchema.virtual("watchersCount").get(function () {
  return this.watchers?.length ?? 0;
});

repositorySchema.virtual("collaboratorsCount").get(function () {
  return this.collaborators?.length ?? 0;
});

// --------------------------------------------------
// INSTANCE METHODS
// --------------------------------------------------

/**
 * isOwnedBy
 *
 * Checks whether a given user ID is the repository owner.
 *
 * @param {ObjectId|string} userId
 * @returns {boolean}
 */
repositorySchema.methods.isOwnedBy = function (userId) {
  return this.owner._id
    ? this.owner._id.toString() === userId.toString()
    : this.owner.toString() === userId.toString();
};

/**
 * getCollaboratorPermission
 *
 * Returns the permission level of a collaborator, or null
 * if the user is not a collaborator.
 *
 * @param {ObjectId|string} userId
 * @returns {string|null} "read" | "write" | "admin" | null
 */
repositorySchema.methods.getCollaboratorPermission = function (userId) {
  const collaborator = this.collaborators.find(
    (collab) => collab.user.toString() === userId.toString(),
  );
  return collaborator ? collaborator.permission : null;
};

/**
 * isStarredBy
 *
 * Checks whether a given user has starred this repository.
 *
 * @param {ObjectId|string} userId
 * @returns {boolean}
 */
repositorySchema.methods.isStarredBy = function (userId) {
  return this.stars.some((id) => id.toString() === userId.toString());
};

/**
 * isWatchedBy
 *
 * Checks whether a given user is watching this repository.
 *
 * @param {ObjectId|string} userId
 * @returns {boolean}
 */
repositorySchema.methods.isWatchedBy = function (userId) {
  return this.watchers.some((id) => id.toString() === userId.toString());
};

// --------------------------------------------------
// PRE-SAVE HOOK — COMPUTE fullName
// --------------------------------------------------

/**
 * Automatically computes and stores fullName before saving.
 * Requires the owner to be populated or the ownerUsername
 * to be set manually before save.
 *
 * In repository.service.js, fullName is set explicitly
 * before calling Repository.create() to avoid population overhead.
 */
repositorySchema.pre("save", function (next) {
  if (this.isModified("name") || this.isModified("owner")) {
    // fullName is set explicitly in the service layer
    // This hook validates it is always present
    if (!this.fullName) {
      return next(new Error("fullName must be set before saving a repository"));
    }
  }
  next();
});

const Repository = model("Repository", repositorySchema);

export default Repository;
