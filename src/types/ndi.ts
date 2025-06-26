
// src/types/ndi.ts - Bhutan NDI integration types
export interface NDIUser {
  citizenId: string;
  fullName: string;
  dateOfBirth?: Date;
  email?: string;
  phoneNumber?: string;
  address?: string;
  institution?: string;
  studentId?: string;
  academicLevel?: string;
  verificationStatus: 'verified' | 'pending' | 'failed' | 'guest';
  permissions: string[];
  lastLogin?: Date;
}

export interface NDIAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  qrCode: string | null;
  threadId?: string;
  deepLinkURL?: string;
  user: NDIUser | null;
  error: string | null;
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

export interface ProofRequestResult {
  proofRequestThreadId: string;
  proofRequestURL: string;
  deepLinkURL: string;
}

export interface ProofCheckResult {
  success: boolean;
  presentation?: any;
}

export interface FoundationalId {
  idNumber: string;
  fullName: string;
}

export interface WebhookRegistrationRequest {
  webhookUrl: string;
  authentication: string;
}

export interface ProofSubscriptionRequest {
  threadId: string;
}
