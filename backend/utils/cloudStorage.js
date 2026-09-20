import multer from 'multer';
import path from 'path';
import { storage } from '../config/firebase.js';

// Bucket backed by the Firebase Admin SDK (same underlying GCS Bucket API)
const bucket = storage.bucket();

// Custom storage engine for multer to work with Google Cloud Storage
class GoogleCloudStorage {
    constructor(options = {}) {
        this.bucket = options.bucket || bucket;
        this.destination = options.destination || 'images/';
        this.filename = options.filename || this._generateFilename;
    }

    _handleFile(req, file, cb) {
        const destination = typeof this.destination === 'function'
            ? this.destination(req, file)
            : this.destination;

        const filename = typeof this.filename === 'function'
            ? this.filename(req, file)
            : this.filename;

        const fullPath = destination + filename;
        const fileUpload = this.bucket.file(fullPath);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
                cacheControl: 'public, max-age=31536000', // 1 year cache
            },
        });

        stream.on('error', (err) => {
            cb(err);
        });

        stream.on('finish', () => {
            // Make the file publicly readable
            fileUpload.makePublic((err) => {
                if (err) {
                    console.error('Error making file public:', err);
                }
            });

            cb(null, {
                bucket: this.bucket.name,
                filename: filename,
                path: fullPath,
                publicUrl: `https://storage.googleapis.com/${this.bucket.name}/${fullPath}`,
            });
        });

        file.stream.pipe(stream);
    }

    _removeFile(req, file, cb) {
        const fileToDelete = this.bucket.file(file.path);
        fileToDelete.delete((err) => {
            cb(err);
        });
    }

    _generateFilename(req, file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    }
}

/**
 * Extracts the storage object path (e.g. "images/filename.jpg") from a filename, relative path,
 * Google Cloud Storage public URL, or Firebase Storage download URL.
 * Returns null if the item is not a Firebase / GCS storage asset (e.g. external link or empty).
 */
export const extractStorageFilePath = (fileOrUrl) => {
    if (!fileOrUrl || typeof fileOrUrl !== 'string') return null;
    const trimmed = fileOrUrl.trim();
    if (!trimmed) return null;

    // Check if input is a URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        try {
            const parsed = new URL(trimmed);
            const hostname = parsed.hostname;
            const pathname = parsed.pathname;

            // 1. Firebase Storage URL format:
            // e.g. https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<filePathEncoded>?...
            if (hostname.includes('firebasestorage.googleapis.com')) {
                const match = pathname.match(/\/o\/([^?#]+)/);
                if (match && match[1]) {
                    return decodeURIComponent(match[1]);
                }
            }

            // 2. Google Cloud Storage URL format:
            // e.g. https://storage.googleapis.com/<bucket>/<filePath>
            // or https://<bucket>.storage.googleapis.com/<filePath>
            // or https://storage.cloud.google.com/<bucket>/<filePath>
            if (hostname.includes('storage.googleapis.com') || hostname.includes('storage.cloud.google.com')) {
                const bucketName = bucket.name;
                if (bucketName && hostname.startsWith(bucketName + '.')) {
                    return pathname.replace(/^\/+/, '');
                }
                const cleanPath = pathname.replace(/^\/+/, '');
                const segments = cleanPath.split('/');
                if (segments.length > 1) {
                    // First segment is the bucket name, remaining segments form the object path
                    return segments.slice(1).join('/');
                }
                return cleanPath;
            }

            // External URLs (e.g. Unsplash, localhost, placeholder) are not in our cloud storage
            return null;
        } catch (e) {
            return null;
        }
    }

    // Bare filename or relative path
    const clean = trimmed.split('?')[0].split('#')[0].replace(/^\/+/, '');
    if (!clean) return null;

    if (clean.startsWith('images/')) {
        return clean;
    }
    return `images/${clean}`;
};

// Helper function to delete files from Firebase / Google Cloud Storage
export const deleteFileFromGCS = async (fileOrUrl) => {
    if (!fileOrUrl) return false;
    const storagePath = extractStorageFilePath(fileOrUrl);
    if (!storagePath) {
        return false;
    }

    try {
        await bucket.file(storagePath).delete();
        console.log(`File ${storagePath} deleted from Firebase Storage`);
        return true;
    } catch (error) {
        if (error.code === 404 || error.message?.includes('No such object')) {
            console.warn(`File ${storagePath} does not exist in Firebase Storage (already deleted or not found)`);
            return false;
        }
        console.error(`Error deleting file ${storagePath} from Firebase Storage:`, error);
        throw error;
    }
};

/**
 * Deletes all Firebase Storage images associated with a product document.
 * Checks product.images, product.imageUrls, and product.image, resolving and deduplicating
 * their storage paths before deletion.
 */
export const deleteProductStorageImages = async (product) => {
    if (!product) return [];

    const candidates = [];
    if (Array.isArray(product.images)) candidates.push(...product.images);
    if (Array.isArray(product.imageUrls)) candidates.push(...product.imageUrls);
    if (product.image) candidates.push(product.image);

    const uniquePaths = new Set();
    for (const item of candidates) {
        const filePath = extractStorageFilePath(item);
        if (filePath) {
            uniquePaths.add(filePath);
        }
    }

    const deleteResults = await Promise.allSettled(
        Array.from(uniquePaths).map(async (filePath) => {
            await deleteFileFromGCS(filePath);
            return filePath;
        })
    );

    return deleteResults;
};

// Helper function to get public URL for a file
export const getPublicUrl = (filename) => {
    return `https://storage.googleapis.com/${bucket.name}/images/${filename}`;
};

// Export the custom storage engine
export default GoogleCloudStorage;