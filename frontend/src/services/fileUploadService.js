import api from './api';

const UPLOAD_URL_FUNCTION = 'https://asia-south1-enduring-wharf-464005-h7.cloudfunctions.net/getSignedUploadUrl';
const READ_URL_FUNCTION = 'https://asia-south1-enduring-wharf-464005-h7.cloudfunctions.net/getSignedReadUrl';

class FileUploadService {
    // Get signed URL for uploading
    async getUploadUrl(fileName, fileType, documentType) {
        try {
            const response = await fetch(UPLOAD_URL_FUNCTION, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName,
                    fileType,
                    documentType
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get upload URL');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting upload URL:', error);
            throw error;
        }
    }

    // Upload file to Google Cloud Storage
    async uploadFile(file, documentType) {
        try {
            // Step 1: Get signed upload URL
            const { uploadUrl, filePath, publicUrl } = await this.getUploadUrl(
                file.name,
                file.type,
                documentType
            );

            // Step 2: Upload file directly to GCS
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file to storage');
            }

            // Return file information
            return {
                filePath,
                publicUrl,
                originalName: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    // Get signed URL for reading/viewing files
    async getFileViewUrl(filePath) {
        try {
            const response = await fetch(READ_URL_FUNCTION, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filePath })
            });

            if (!response.ok) {
                throw new Error('Failed to get file URL');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error getting file URL:', error);
            return null;
        }
    }

    // Upload through backend API (alternative method)
    async uploadToBackend(file, metadata = {}) {
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        const response = await api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
}

export default new FileUploadService();
