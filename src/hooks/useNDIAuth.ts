import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import type { NDIUser, NDIAuthState } from '@/types/ndi';
import { ndiApiService } from '@/services/ndiApiService'; // Named import (correct)

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

  /**
   * Starts lightweight polling to check authentication status
   * With webhooks, this should resolve very quickly
   */
  const startAuthenticationPolling = useCallback((threadId: string) => {
    console.log('🔄 Starting authentication polling for thread:', threadId);
    
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    let attempts = 0;
    const maxAttempts = 60; // 3 minutes max (60 * 3 seconds)

    const interval = setInterval(async () => {
      attempts++;
      console.log(`🔍 Polling attempt ${attempts}/${maxAttempts} for thread:`, threadId);
      
      try {
        const result = await ndiApiService.checkProof(threadId); // Updated method name
        
        if (result.success && result.presentation) {
          console.log('🎉 Authentication successful! Processing user data...');
          
          // Parse the presentation to extract user data
          const foundationalId = ndiApiService.parseProofPresentation(result.presentation);
          
          const ndiUser: NDIUser = {
            citizenId: foundationalId.idNumber,
            fullName: foundationalId.fullName,
            verificationStatus: 'verified',
            permissions: ['view_profile', 'access_courses', 'receive_certificates']
          };
          
          console.log('✅ NDI User authenticated:', ndiUser);
          
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
          
          // Store in session for persistence
          sessionStorage.setItem('ndi_auth', JSON.stringify({
            isAuthenticated: true,
            user: ndiUser,
            timestamp: Date.now()
          }));
          
          console.log('🚀 NDI authentication successful - user will be redirected to chat interface');
          
          // Clear polling
          clearInterval(interval);
          setPollingInterval(null);
          
          // Trigger a page refresh to ensure the main app picks up the authentication state
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          
        } else if (result.error) {
          console.log('❌ Authentication failed:', result.error);
          
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error || 'Authentication failed'
          }));
          
          clearInterval(interval);
          setPollingInterval(null);
        }
        // If not success and no error, continue polling
        
      } catch (error) {
        console.error('❌ Error during authentication polling:', error);
        // Continue polling unless max attempts reached
      }
      
      // Stop polling after max attempts
      if (attempts >= maxAttempts) {
        console.log('⏰ Authentication polling timeout reached');
        clearInterval(interval);
        setPollingInterval(null);
        
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: "Authentication timeout. Please try again."
        }));
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
  }, [pollingInterval]);

  /**
   * Generates QR code and starts the authentication flow
   */
  const generateCredentialRequest = async () => {
    console.log('🚀 Starting NDI authentication flow...');
    
    setAuthState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      qrCode: null,
      threadId: undefined,
      deepLinkURL: undefined
    }));
    
    try {
      // Step 1: Create proof request (backend will handle webhook setup)
      console.log('📝 Creating proof request...');
      const result = await ndiApiService.createFoundationalIdProofRequest();
      
      // Step 2: Generate QR code from the proof request URL
      console.log('🔳 Generating QR code...');
      const qrCodeImage = await QRCode.toDataURL(result.proofRequestURL, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Step 3: Update state with QR code
      setAuthState(prev => ({
        ...prev,
        qrCode: qrCodeImage,
        threadId: result.proofRequestThreadId,
        deepLinkURL: result.deepLinkURL,
        isLoading: false
      }));
      
      console.log('✅ QR code generated successfully!');
      console.log('📱 User can now scan the QR code with NDI wallet');
      
      // Step 4: Start polling for authentication completion
      startAuthenticationPolling(result.proofRequestThreadId);
      
    } catch (error) {
      console.error('❌ Error in authentication flow:', error);
      
      let errorMessage = "Failed to generate authentication request";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  };

  /**
   * Logs out the current user
   */
  const logout = () => {
    console.log('👋 Logging out NDI user');
    
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
    console.log('✅ Logout complete');
  };

  /**
   * Retries the authentication process
   */
  const retryAuthentication = () => {
    console.log('🔄 Retrying NDI authentication');
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
          console.log('🔄 Restoring NDI session from storage');
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: authData.user
          }));
        } else {
          console.log('⏰ NDI session expired, removing from storage');
          sessionStorage.removeItem('ndi_auth');
        }
      } catch (error) {
        console.error('❌ Error parsing stored auth data:', error);
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