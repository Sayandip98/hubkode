import { body } from "express-validator";

const createOrganizationValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Organization name is required")
    .isLength({ min: 3, max: 39 })
    .withMessage("Organization name must be between 3 and 39 characters")
    .matches(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/)
    .withMessage(
      "Organization name can only contain alphanumeric characters and hyphens",
    )
    .toLowerCase(),

  body("displayName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Display name cannot exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("website")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Website URL cannot exceed 255 characters")
    .custom((value) => {
      if (value && value.length > 0) {
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
        if (!urlPattern.test(value)) {
          throw new Error("Please provide a valid URL");
        }
      }
      return true;
    }),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location cannot exceed 100 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

const updateOrganizationValidator = [
  body("displayName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Display name cannot exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("website")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Website URL cannot exceed 255 characters")
    .custom((value) => {
      if (value && value.length > 0) {
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
        if (!urlPattern.test(value)) {
          throw new Error("Please provide a valid URL");
        }
      }
      return true;
    }),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location cannot exceed 100 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

const inviteMemberValidator = [
  body("username").trim().notEmpty().withMessage("Username is required"),

  body("role")
    .optional()
    .isIn(["owner", "member"])
    .withMessage("Role must be owner or member"),
];

const updateMemberRoleValidator = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["owner", "member"])
    .withMessage("Role must be owner or member"),
];

export {
  createOrganizationValidator,
  updateOrganizationValidator,
  inviteMemberValidator,
  updateMemberRoleValidator,
};
