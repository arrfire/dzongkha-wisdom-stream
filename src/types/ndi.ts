// src/types/ndi.ts - Updated with guest verification status, and missing interfaces
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

// Added missing interfaces for NDI authentication flow
export interface ProofRequestResult {
  proofRequestThreadId: string;
  proofRequestURL: string;
  deepLinkURL: string;
}

export interface ProofCheckResult {
  success: boolean;
  presentation: any; // Using 'any' to match dynamic C# JsonElement?
  error?: string; // Added optional error property to match usage in useNDIAuth.ts
}

export interface FoundationalId {
  idNumber: string;
  fullName: string;
}

export interface WebhookRegistrationRequest {
  webhookUrl: string;
  authentication: WebhookAuthDto;
}

export interface WebhookAuthDto {
  type: string;
  version: string;
  data: any;
}

export interface ProofSubscriptionRequest {
  threadId: string;
  webhookId?: string; // Added webhookId as it's used in the backend's subscription request
}

export interface NDIVerificationRequest { // This was already present, keeping it
  redirectUrl: string;
  requestedData: string[];
  purpose: string;
}

export interface NDIVerificationResponse { // This was already present, keeping it
  success: boolean;
  user?: NDIUser;
  credentials?: NDICredential[];
  error?: string;
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