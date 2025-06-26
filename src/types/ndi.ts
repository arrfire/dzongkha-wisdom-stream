export interface NDIUser {
  citizenId?: string;
  fullName: string;
  email?: string;
  studentId?: string;
  institution?: string;
  academicLevel?: string;
  verificationStatus?: 'verified' | 'pending' | 'failed';
  permissions: string[];
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

export interface ProofRequestResult {
  proofRequestThreadId: string;
  proofRequestURL: string;
  deepLinkURL: string;
}

export interface ProofCheckResult {
  success: boolean;
  presentation?: any;
  error?: string; // Added error field
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