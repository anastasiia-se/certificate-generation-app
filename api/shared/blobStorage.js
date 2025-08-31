const { BlobServiceClient } = require('@azure/storage-blob');

class BlobStorageService {
    constructor() {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connectionString) {
            console.warn('Azure Storage connection string not found. Using local storage fallback.');
            this.isConfigured = false;
            return;
        }
        
        try {
            this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            this.containerName = 'certificates';
            this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            this.isConfigured = true;
        } catch (error) {
            console.error('Failed to initialize Blob Storage:', error);
            this.isConfigured = false;
        }
    }

    async uploadPDF(certificateId, pdfBuffer) {
        if (!this.isConfigured) {
            console.warn('Blob storage not configured, skipping upload');
            return null;
        }

        try {
            const blobName = `${certificateId}.pdf`;
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
            
            await blockBlobClient.upload(pdfBuffer, pdfBuffer.length, {
                blobHTTPHeaders: {
                    blobContentType: 'application/pdf'
                }
            });

            return blockBlobClient.url;
        } catch (error) {
            console.error('Error uploading PDF to blob storage:', error);
            throw error;
        }
    }

    async downloadPDF(certificateId) {
        if (!this.isConfigured) {
            throw new Error('Blob storage not configured - check AZURE_STORAGE_CONNECTION_STRING');
        }

        try {
            const blobName = `${certificateId}.pdf`;
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
            
            // Check if blob exists first
            const exists = await blockBlobClient.exists();
            if (!exists) {
                const error = new Error(`Certificate PDF not found: ${blobName}`);
                error.statusCode = 404;
                throw error;
            }
            
            const downloadResponse = await blockBlobClient.download(0);
            const downloadedContent = await this.streamToBuffer(downloadResponse.readableStreamBody);
            
            return downloadedContent;
        } catch (error) {
            console.error('Error downloading PDF from blob storage:', error);
            if (error.statusCode) {
                throw error;
            }
            // Add status code if not present
            error.statusCode = error.statusCode || 500;
            throw error;
        }
    }

    async streamToBuffer(readableStream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on('data', (data) => {
                chunks.push(data instanceof Buffer ? data : Buffer.from(data));
            });
            readableStream.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            readableStream.on('error', reject);
        });
    }

    async deletePDF(certificateId) {
        if (!this.isConfigured) {
            return;
        }

        try {
            const blobName = `${certificateId}.pdf`;
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.delete();
        } catch (error) {
            console.error('Error deleting PDF from blob storage:', error);
        }
    }
}

module.exports = new BlobStorageService();