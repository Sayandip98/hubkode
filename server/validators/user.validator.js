import { body } from "express-validator";

const updateProfileValidator = [
  body("displayName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Display name cannot exceed 100 characters"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location cannot exceed 100 characters"),

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

  body("company")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Company name cannot exceed 100 characters"),
];

const avatarValidator = [
  body().custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Image file is required");
    }
    return true;
  }),
];

export { updateProfileValidator, avatarValidator };
