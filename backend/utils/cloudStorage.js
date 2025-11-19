import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';

// Initialize Google Cloud Storage
const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE, // Path to service account key file
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

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

// Helper function to delete files from Google Cloud Storage
export const deleteFileFromGCS = async (filename) => {
    try {
        await bucket.file(`images/${filename}`).delete();
        console.log(`File ${filename} deleted from Google Cloud Storage`);
    } catch (error) {
        console.error(`Error deleting file ${filename} from GCS:`, error);
        throw error;
    }
};

// Helper function to get public URL for a file
export const getPublicUrl = (filename) => {
    return `https://storage.googleapis.com/${bucket.name}/images/${filename}`;
};

// Export the custom storage engine
export default GoogleCloudStorage;