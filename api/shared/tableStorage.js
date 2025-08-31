const { TableClient } = require('@azure/data-tables');

class TableStorageService {
    constructor() {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connectionString) {
            console.warn('Azure Storage connection string not found. Using in-memory fallback.');
            this.isConfigured = false;
            this.inMemoryStore = [];
            return;
        }

        try {
            this.tableName = 'certificates';
            this.tableClient = TableClient.fromConnectionString(connectionString, this.tableName);
            this.isConfigured = true;
            this.initializeTable();
        } catch (error) {
            console.error('Failed to initialize Table Storage:', error);
            this.isConfigured = false;
            this.inMemoryStore = [];
        }
    }

    async initializeTable() {
        if (!this.isConfigured) return;
        
        try {
            // Create table if it doesn't exist
            await this.tableClient.createTable();
            console.log(`Table '${this.tableName}' is ready`);
        } catch (error) {
            if (error.statusCode === 409) {
                // Table already exists
                console.log(`Table '${this.tableName}' already exists`);
            } else {
                console.error('Error creating table:', error);
            }
        }
    }

    async addCertificate(certificateData) {
        if (!this.isConfigured) {
            // Fallback to in-memory storage
            this.inMemoryStore.push(certificateData);
            return certificateData;
        }

        try {
            // Prepare entity for Table Storage
            const entity = {
                partitionKey: 'CERT',
                rowKey: certificateData.certificateId,
                name: certificateData.name,
                surname: certificateData.surname,
                recipientEmail: certificateData.recipientEmail,
                managerEmail: certificateData.managerEmail,
                completionDate: certificateData.completionDate,
                sentDate: certificateData.sentDate,
                emailSent: certificateData.emailSent,
                certificatePath: certificateData.certificatePath || '',
                timestamp: new Date().toISOString()
            };

            await this.tableClient.createEntity(entity);
            console.log('Certificate saved to Table Storage:', certificateData.certificateId);
            return certificateData;
        } catch (error) {
            console.error('Error saving certificate to Table Storage:', error);
            // Fallback to in-memory
            this.inMemoryStore.push(certificateData);
            return certificateData;
        }
    }

    async getCertificateById(certificateId) {
        if (!this.isConfigured) {
            return this.inMemoryStore.find(cert => cert.certificateId === certificateId);
        }

        try {
            const entity = await this.tableClient.getEntity('CERT', certificateId);
            return this.entityToCertificate(entity);
        } catch (error) {
            if (error.statusCode === 404) {
                return null;
            }
            console.error('Error retrieving certificate:', error);
            // Fallback to in-memory
            return this.inMemoryStore.find(cert => cert.certificateId === certificateId);
        }
    }

    async getAllCertificates() {
        if (!this.isConfigured) {
            return this.inMemoryStore;
        }

        try {
            const certificates = [];
            const entities = this.tableClient.listEntities({
                queryOptions: { filter: `PartitionKey eq 'CERT'` }
            });

            for await (const entity of entities) {
                certificates.push(this.entityToCertificate(entity));
            }

            // Sort by sentDate descending (newest first)
            certificates.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
            
            return certificates;
        } catch (error) {
            console.error('Error listing certificates:', error);
            // Fallback to in-memory
            return this.inMemoryStore;
        }
    }

    async updateCertificate(certificateId, updates) {
        if (!this.isConfigured) {
            const index = this.inMemoryStore.findIndex(cert => cert.certificateId === certificateId);
            if (index !== -1) {
                this.inMemoryStore[index] = { ...this.inMemoryStore[index], ...updates };
                return this.inMemoryStore[index];
            }
            return null;
        }

        try {
            const entity = await this.tableClient.getEntity('CERT', certificateId);
            const updatedEntity = {
                ...entity,
                ...updates,
                partitionKey: 'CERT',
                rowKey: certificateId
            };

            await this.tableClient.updateEntity(updatedEntity, 'Merge');
            return this.entityToCertificate(updatedEntity);
        } catch (error) {
            console.error('Error updating certificate:', error);
            return null;
        }
    }

    async deleteCertificate(certificateId) {
        if (!this.isConfigured) {
            const index = this.inMemoryStore.findIndex(cert => cert.certificateId === certificateId);
            if (index !== -1) {
                this.inMemoryStore.splice(index, 1);
                return true;
            }
            return false;
        }

        try {
            await this.tableClient.deleteEntity('CERT', certificateId);
            return true;
        } catch (error) {
            console.error('Error deleting certificate:', error);
            return false;
        }
    }

    // Helper method to convert Table Storage entity to certificate object
    entityToCertificate(entity) {
        return {
            certificateId: entity.rowKey,
            name: entity.name,
            surname: entity.surname,
            recipientEmail: entity.recipientEmail,
            managerEmail: entity.managerEmail,
            completionDate: entity.completionDate,
            sentDate: entity.sentDate,
            emailSent: entity.emailSent,
            certificatePath: entity.certificatePath
        };
    }
}

module.exports = new TableStorageService();