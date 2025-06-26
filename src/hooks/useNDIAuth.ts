// src/hooks/useNDIAuth.ts
import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import type { NDIUser, NDIAuthState } from '@/types/ndi';
import { ndiApiService } from '@/services/ndiApiService';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

export const useNDIAuth = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [authState, setAuthState] = useState<NDIAuthState>({
    isAuthenticated: false,
    isLoading: false,
    qrCode: null,
    user: null, // user will be null until actual proof data is received (if needed later)
    error: null
  });

  // Removed pollingInterval state and useEffect cleanup as polling is no longer needed

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
      // Step 1: Create proof request (backend will handle webhook setup internally)
      // The `createFoundationalIdProofRequest` method already calls `subscribeViaBackend`
      // If this call succeeds, it means the webhook subscription was initiated.
      console.log('📝 Creating proof request and subscribing to webhook via backend...');
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
      
      // Step 3: Update state with QR code and immediately consider authenticated for redirect
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true, // Webhook subscription successful, proceed to chat
        user: null, // User data will be populated later if proof processing is required on frontend
        qrCode: qrCodeImage,
        threadId: result.proofRequestThreadId,
        deepLinkURL: result.deepLinkURL,
        isLoading: false
      }));
      
      console.log('✅ QR code generated successfully and webhook subscribed!');
      console.log('🚀 Redirecting to AI Chat interface...');
      
      // Redirect to chat page immediately after successful webhook subscription initiation
      navigate('/chatpage'); 

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
    
    // Clear any ongoing polling (no longer applicable but kept for safety if refactored)
    // if (pollingInterval) {
    //   clearInterval(pollingInterval);
    //   setPollingInterval(null);
    // }
    
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