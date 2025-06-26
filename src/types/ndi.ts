// src/types/ndi.ts - Updated with guest verification status
export interface NDIUser {
  citizenId: string;
  fullName: string;
  institution?: string;
  academicLevel?: string;
  studentId?: string;
  profilePicture?: string;
  verificationStatus: 'verified' | 'pending' | 'failed' | 'guest'; // Added 'guest' option
  permissions: string[];
}

export interface NDICredential {
  id: string;
  type: string;
  issuer: string;
  issuedTo: string;
  issuedAt: string;
  expiresAt?: string;
  data: {
    [key: string]: any;
  };
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    jws: string;
  };
}

export interface NDIVerificationRequest {
  redirectUrl: string;
  requestedData: string[];
  purpose: string;
}

export interface NDIVerificationResponse {
  success: boolean;
  user?: NDIUser;
  credentials?: NDICredential[];
  error?: string;
}

export interface ProofCheckResult {
  success: boolean;
  presentation: any;
}