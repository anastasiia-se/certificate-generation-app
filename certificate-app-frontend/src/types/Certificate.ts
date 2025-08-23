export interface CertificateData {
  name: string;
  surname: string;
  recipientEmail: string;
  managerEmail: string;
  completionDate: string;
  certificateId?: string;
}

export interface CertificateResponse {
  success: boolean;
  message?: string;
  certificateUrl?: string;
  certificateId?: string;
  emailSent?: boolean;
}

export interface CertificateRecord extends CertificateData {
  certificateId: string;
  sentDate: string;
  emailSent: boolean;
}