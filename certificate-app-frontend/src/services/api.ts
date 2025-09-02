import axios from 'axios';
import { CertificateData, CertificateResponse, CertificateRecord } from '../types/Certificate';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://certificate-functions-app-77132.azurewebsites.net/api';

export const certificateAPI = {
  generateCertificate: async (data: CertificateData): Promise<CertificateResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/GenerateCertificate`, data);
      return response.data;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  },

  downloadCertificate: async (certificateId: string): Promise<Blob> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/certificates/${certificateId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  },

  getCertificateHistory: async (): Promise<CertificateRecord[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/GetCertificateHistory`);
      return response.data;
    } catch (error) {
      console.error('Error fetching certificate history:', error);
      return [];
    }
  },

  deleteDiploma: async (diplomaId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/diplomas/${diplomaId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting diploma:', error);
      throw error;
    }
  }
};