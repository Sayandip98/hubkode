import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";
import { ApiError } from "../utils/apiResponse.js";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const memoryStorage = multer.memoryStorage();

const imageFileFilter = (req, file, callback) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return callback(
      new ApiError(
        400,
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF images are allowed.`,
      ),
      false,
    );
  }
  callback(null, true);
};

const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error)
          return reject(
            new ApiError(500, `Cloudinary upload failed: ${error.message}`),
          );
        resolve(result);
      },
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn(
      `Failed to delete Cloudinary asset "${publicId}": ${error.message}`,
    );
  }
};

const multerUploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("avatar");

const multerUploadAssets = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
}).array("assets", 5);

const uploadAvatar = (req, res, next) => {
  multerUploadAvatar(req, res, async (err) => {
    if (err) return next(err);

    if (!req.file) return next();

    try {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "hubkode/avatars",
        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      });
      req.cloudinaryResult = result;
      next();
    } catch (uploadError) {
      next(uploadError);
    }
  });
};

const uploadRepositoryAsset = (req, res, next) => {
  multerUploadAssets(req, res, async (err) => {
    if (err) return next(err);

    if (!req.files || req.files.length === 0) return next();

    try {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, {
          folder: "hubkode/repositories",
          transformation: [
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        }),
      );

      req.cloudinaryResults = await Promise.all(uploadPromises);
      next();
    } catch (uploadError) {
      next(uploadError);
    }
  });
};

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "File size exceeds the allowed limit"));
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(new ApiError(400, "Too many files uploaded at once"));
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(new ApiError(400, `Unexpected file field: ${err.field}`));
    }
    return next(new ApiError(400, err.message));
  }

  next(err);
};

export {
  uploadAvatar,
  uploadRepositoryAsset,
  handleMulterError,
  uploadToCloudinary,
  deleteFromCloudinary,
};
