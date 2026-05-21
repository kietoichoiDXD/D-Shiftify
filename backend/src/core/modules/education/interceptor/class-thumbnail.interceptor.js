import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { ROOT_DIR } from 'core/env';
import { logger } from 'packages/logger';
import { BadRequestException, InternalServerException } from 'packages/httpException';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];
const UPLOAD_DIR = `${ROOT_DIR}/core/uploads/education/classes`;

const ensureUploadDir = () => {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
};

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            ensureUploadDir();
            cb(null, UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname).toLowerCase();
            const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9-_]/g, '-');
            cb(null, `${baseName}-${Date.now()}${extension}`);
        },
    }),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const isValidExtension = ALLOWED_EXTENSIONS.includes(extension);
        const isValidMimeType = ALLOWED_MIME_TYPES.includes(file.mimetype);

        if (!isValidExtension || !isValidMimeType) {
            return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'thumbnail'));
        }

        return cb(null, true);
    },
}).single('thumbnail');

export class ClassThumbnailInterceptor {
    intercept = (req, res, next) => upload(req, res, err => {
        if (err instanceof multer.MulterError) {
            logger.error(err.code);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new BadRequestException('Thumbnail must be smaller than or equal to 5MB'));
            }
            return next(new BadRequestException('Only .png, .jpg, and .jpeg images are allowed'));
        }

        if (err) {
            logger.error(err.message);
            return next(new InternalServerException(err.message));
        }

        if (!req.file) {
            return next(new BadRequestException('Thumbnail file is required'));
        }

        return next();
    });
}
