import { useState, useEffect, useCallback } from 'react';
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
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const result = await ndiApiService.checkProof(threadId);
        
        if (result.success && result.presentation) {
          // Parse the presentation to extract user data
          const foundationalId = ndiApiService.parseProofPresentation(result.presentation);
          
          const ndiUser: NDIUser = {
            citizenId: foundationalId.idNumber,
            fullName: foundationalId.fullName,
            verificationStatus: 'verified',
            permissions: ['view_profile', 'access_courses', 'receive_certificates']
          };
          
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
    try {
      // Register webhook for real-time updates (optional)
      const webhookUrl = `${window.location.origin}/api/ndi/webhook`;
      
      await ndiApiService.registerWebhook({
        webhookUrl,
        authentication: 'bearer_token_or_signature' // Configure based on your backend
      });
      
      // Subscribe to specific thread
      await ndiApiService.subscribeThread({ threadId });
      
      console.log('Webhook setup completed for thread:', threadId);
    } catch (error) {
      console.error('Failed to setup webhook:', error);
      // Don't fail the whole flow if webhook setup fails
    }
  };

  const generateCredentialRequest = async (requiredCredentials: string[] = ['foundational_id']) => {
    setAuthState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      qrCode: null,
      threadId: undefined,
      deepLinkURL: undefined
    }));
    
    try {
      // Call actual backend API
      const result = await ndiApiService.createFoundationalIdProofRequest();
      
      setAuthState(prev => ({
        ...prev,
        qrCode: result.proofRequestURL,
        threadId: result.proofRequestThreadId,
        deepLinkURL: result.deepLinkURL,
        isLoading: false
      }));
      
      // Setup webhook (optional, for real-time updates)
      await setupWebhook(result.proofRequestThreadId);
      
      // Start polling for proof completion
      startProofPolling(result.proofRequestThreadId);
      
    } catch (error) {
      console.error('Error generating credential request:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to generate authentication request",
        isLoading: false
      }));
    }
  };

  const logout = () => {
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
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: authData.user
          }));
        } else {
          // Session expired
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