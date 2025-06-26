
// src/types/ndi.ts - Bhutan NDI integration types
export interface NDIUser {
  citizenId: string;
  fullName: string;
  dateOfBirth?: Date;
  email?: string;
  phoneNumber?: string;
  address?: string;
  institution?: string;
  verificationStatus: 'verified' | 'pending' | 'failed' | 'guest';
  permissions: string[];
  lastLogin?: Date;
}

export interface NDIAuthResponse {
  success: boolean;
  user?: NDIUser;
  error?: string;
  sessionToken?: string;
}

export interface NDIVerificationRequest {
  citizenId: string;
  biometricData?: string;
  documentHash?: string;
}
