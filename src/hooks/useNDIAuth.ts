import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import type { NDIUser, NDIAuthState } from '@/types/ndi';
import { ndiApiService } from '@/services/ndiApiService';

export const useNDIAuth = () => {
  const [authState, setAuthState] = useState<NDIAuthState>({
    isAuthenticated: false,
    isLoading: false,
    qrCode: null,
    user: null,
    error: null
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const startProofPolling = useCallback((threadId: string) => {
    console.log('Starting proof polling for thread:', threadId);
    
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        console.log('Polling proof status for thread:', threadId);
        const result = await ndiApiService.checkProof(threadId);
        
        if (result.success && result.presentation) {
          console.log('Proof verification successful!');
          
          // Parse the presentation to extract user data
          const foundationalId = ndiApiService.parseProofPresentation(result.presentation);
          
          const ndiUser: NDIUser = {
            citizenId: foundationalId.idNumber,
            fullName: foundationalId.fullName,
            verificationStatus: 'verified',
            permissions: ['view_profile', 'access_courses', 'receive_certificates']
          };
          
          console.log('NDI User authenticated:', ndiUser);
          
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: ndiUser,
            qrCode: null,
            threadId: undefined,
            deepLinkURL: undefined,
            isLoading: false,
            error: null
          }));
          
          // Store in session
          sessionStorage.setItem('ndi_auth', JSON.stringify({
            isAuthenticated: true,
            user: ndiUser,
            timestamp: Date.now()
          }));
          
          // Clear polling
          clearInterval(interval);
          setPollingInterval(null);
        }
      } catch (error) {
        console.error('Error polling proof status:', error);
        // Don't set error state for polling failures, just log them
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
    
    // Clear polling after 5 minutes timeout
    setTimeout(() => {
      console.log('Polling timeout reached for thread:', threadId);
      clearInterval(interval);
      setPollingInterval(null);
      
      // Set timeout error if still loading
      setAuthState(prev => {
        if (prev.isLoading && !prev.isAuthenticated) {
          return {
            ...prev,
            isLoading: false,
            error: "Authentication timeout. Please try again."
          };
        }
        return prev;
      });
    }, 300000); // 5 minutes
  }, [pollingInterval]);

  const setupWebhook = async (threadId: string) => {
    // Skip webhook setup for now - we'll rely on polling instead
    console.log('Skipping webhook setup, using polling for thread:', threadId);
    return Promise.resolve();
  };

  const generateCredentialRequest = async (requiredCredentials: string[] = ['foundational_id']) => {
    console.log('Generating credential request...');
    
    setAuthState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      qrCode: null,
      threadId: undefined,
      deepLinkURL: undefined
    }));
    
    try {
      console.log('Calling backend API...');
      
      // Call actual backend API
      const result = await ndiApiService.createFoundationalIdProofRequest();
      
      console.log('Backend response received:', result);
      
      // Generate QR code from the proofRequestURL
      let generatedQRCode: string;
      try {
        generatedQRCode = await QRCode.toDataURL(result.proofRequestURL, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        console.log('QR code generated successfully');
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        throw new Error('Failed to generate QR code from proof request URL');
      }
      
      // Use the generated QR code image
      const qrCodeToUse = generatedQRCode;
      
      setAuthState(prev => ({
        ...prev,
        qrCode: qrCodeToUse,
        threadId: result.proofRequestThreadId,
        deepLinkURL: result.deepLinkURL,
        isLoading: false
      }));
      
      console.log('State updated with QR code and thread ID');
      
      // Setup webhook (optional, for real-time updates) - skipped for now
      // await setupWebhook(result.proofRequestThreadId);
      
      // Start polling for proof completion
      startProofPolling(result.proofRequestThreadId);
      
    } catch (error) {
      console.error('Error generating credential request:', error);
      
      let errorMessage = "Failed to generate authentication request";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Add more specific error messages
      if (errorMessage.includes('Network error')) {
        errorMessage += "\n\nPlease check:\n1. Your internet connection\n2. Backend server is running\n3. Backend URL is correct";
      } else if (errorMessage.includes('CORS')) {
        errorMessage += "\n\nCORS issue: Contact your backend developer to allow requests from this domain.";
      } else if (errorMessage.includes('Available fields')) {
        errorMessage += "\n\nThe backend response format doesn't match what the frontend expects. Check the API documentation.";
      }
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  };

  const logout = () => {
    console.log('Logging out NDI user');
    
    // Clear any ongoing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      qrCode: null,
      threadId: undefined,
      deepLinkURL: undefined,
      user: null,
      error: null
    });
    
    sessionStorage.removeItem('ndi_auth');
  };

  const retryAuthentication = () => {
    console.log('Retrying NDI authentication');
    generateCredentialRequest();
  };

  // Check for existing session on page load
  useEffect(() => {
    const stored = sessionStorage.getItem('ndi_auth');
    if (stored) {
      try {
        const authData = JSON.parse(stored);
        // Check if session is still valid (24 hours)
        if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
          console.log('Restoring NDI session from storage');
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: authData.user
          }));
        } else {
          // Session expired
          console.log('NDI session expired, removing from storage');
          sessionStorage.removeItem('ndi_auth');
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        sessionStorage.removeItem('ndi_auth');
      }
    }
  }, []);

  return {
    ...authState,
    generateCredentialRequest,
    logout,
    retryAuthentication
  };
};