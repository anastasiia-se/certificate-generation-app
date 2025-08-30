// Shared in-memory certificate storage
// In production, this would be replaced with Cosmos DB or other persistent storage

const certificateStore = [];

module.exports = {
    addCertificate: (certificate) => {
        certificateStore.push(certificate);
        return certificate;
    },
    
    getAllCertificates: () => {
        // Return sorted by sent date, newest first
        return certificateStore.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
    },
    
    getCertificateById: (certificateId) => {
        return certificateStore.find(cert => cert.certificateId === certificateId);
    }
};