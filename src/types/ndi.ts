
// ===== 1. Create src/types/ndi.ts =====

export interface NDIUser {
    citizenId: string;
    fullName: string;
    email?: string;
    studentId?: string;
    institution?: string;
    academicLevel?: string;
    verificationStatus: 'verified' | 'pending' | 'failed';
    permissions: string[];
  }
  
  export interface NDIAuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    qrCode: string | null;
    user: NDIUser | null;
    error: string | null;
  }