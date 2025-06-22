// ===== 2. Create src/hooks/useNDIAuth.ts =====

import { useState, useEffect } from 'react';
import type { NDIUser, NDIAuthState } from '@/types/ndi';

export const useNDIAuth = () => {
  const [authState, setAuthState] = useState<NDIAuthState>({
    isAuthenticated: false,
    isLoading: false,
    qrCode: null,
    user: null,
    error: null
  });

  const generateCredentialRequest = async (requiredCredentials: string[] = ['student_id', 'academic_records']) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Create demo credential request
      const credentialRequest = {
        type: "CredentialRequest",
        version: "1.0",
        requestId: `edustream_${Date.now()}`,
        credentials: requiredCredentials,
        platform: "Edustream Learning Platform",
        purpose: "Educational platform authentication"
      };
      
      // Generate QR code for demo
      const qrData = JSON.stringify(credentialRequest);
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
      
      setAuthState(prev => ({
        ...prev,
        qrCode: qrCodeUrl,
        isLoading: false
      }));
      
      // Simulate authentication after 10 seconds
      setTimeout(() => {
        const mockUser: NDIUser = {
          citizenId: "encrypted_citizen_id_hash",
          fullName: "Tenzin Norbu",
          email: "tenzin.norbu@education.bt",
          studentId: "RUB/2024/001",
          institution: "Royal University of Bhutan",
          academicLevel: "Undergraduate",
          verificationStatus: "verified",
          permissions: ["view_profile", "access_courses", "receive_certificates"]
        };
        
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: mockUser,
          qrCode: null,
          isLoading: false
        }));
        
        // Store in session
        sessionStorage.setItem('ndi_auth', JSON.stringify({
          isAuthenticated: true,
          user: mockUser,
          timestamp: Date.now()
        }));
      }, 10000);
      
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: "Failed to generate authentication request",
        isLoading: false
      }));
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      qrCode: null,
      user: null,
      error: null
    });
    sessionStorage.removeItem('ndi_auth');
  };

  // Check for existing session on page load
  useEffect(() => {
    const stored = sessionStorage.getItem('ndi_auth');
    if (stored) {
      try {
        const authData = JSON.parse(stored);
        if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: authData.user
          }));
        } else {
          sessionStorage.removeItem('ndi_auth');
        }
      } catch (error) {
        sessionStorage.removeItem('ndi_auth');
      }
    }
  }, []);

  return {
    ...authState,
    generateCredentialRequest,
    logout
  };
};