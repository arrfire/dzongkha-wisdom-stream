// src/services/ndiApiService.ts
import { 
  ProofRequestResult, 
  ProofCheckResult, 
  FoundationalId,
  WebhookRegistrationRequest,
  ProofSubscriptionRequest 
} from '@/types/ndi';

class NDIApiService {
  private baseUrl: string;
  private ndiWebhookUrl: string;
  private ndiToken: string;
  private webhookId: string;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_NDI_BACKEND_URL || '/api';
    this.ndiWebhookUrl = import.meta.env.VITE_WEBHOOK_BASE_URL || 'https://demo-client.bhutanndi.com/webhook/v1';
    // IMPORTANT: Ensure this token is up-to-date and valid.
    this.ndiToken = 'eyJraWQiOiJzd3hhdGVQK1lmR2liT2ZiTmNjWGpjYkptWnVqNGlrXC80SWh5TW9JdFhLTT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzdHE3aG8yM2c1cmlzbmRkOTBhNzZqcmU1ZiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibmRpLXNlcnZpY2VcL3JlYWQud3JpdGUiLCJhdXRoX3RpbWUiOjE3NTA5MzgzMjQsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aGVhc3QtMV9wdFRmQ2VNYnkiLCJleHAiOjE3NTEwMjQ3MjQsImlhdCI6MTc1MDkzODMyNCwidmVyc2lvbiI6MiwianRpIjoiM2ExOTYzOGQtZWVmZi00NzA3LTkxOGEtMjAyMDc1NGYwYTc2IiwiY2xpZW50X2lkIjoiM3RxN2hvMjNnNXJpc25kZDkwYTc2anJlNWYifQ.LwHWW5e8CfkRCQ34WIIgMSOeK_oBxIlJ_WKEd3tJZ-Ami3OUtXiDaQtd6O8MnlsZWjRRAO-fXfIXdTt099hsJzrNK2LEER5Vxb5KQRNFstoiga49jMw-8cyVW96KNFMm20rg53htSnDOV3wnXGzMqF9eVnH230QtW6tXo7XGERMONyi_mk4F5f1Vi9uNw79p2QJsw46w-h7-lwGqHyffdXGq1UI3UDT2auDNHTW3tlCq-jxqucvQunB6B3Atbx2PQrEOuewYUimYz_e42o-JKjUkho3BOru0joEO0UTn2Ov7EiMHdzy1OW7O2vn3HNOL6J3xYwWBvMhU6G9k_1d5ww';
    this.webhookId = import.meta.env.VITE_WEBHOOK_ID || 'edustream40';
    console.log('NDI Backend URL:', this.baseUrl);
    console.log('NDI Webhook URL:', this.ndiWebhookUrl);
    console.log('Webhook ID:', this.webhookId);
  } 

  async createFoundationalIdProofRequest(): Promise<ProofRequestResult> {
    // This URL remains as /api/Auth/ndi/request
    const fullUrl = `${this.baseUrl}/api/Auth/ndi/request`;
    console.log('Making request to:', fullUrl);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create proof request: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Raw backend response:', JSON.stringify(data, null, 2));
      
      // Handle the actual response format from your backend
      let proofRequestThreadId: string;
      let proofRequestURL: string;
      let deepLinkURL: string;
      
      // Your backend returns these exact field names
      if (data.threadId) {
        proofRequestThreadId = data.threadId;
      } else {
        console.error('Available fields in response:', Object.keys(data));
        throw new Error(`Missing thread ID in backend response. Available fields: ${Object.keys(data).join(', ')}`);
      }
      
      if (data.proofRequestUrl) {
        proofRequestURL = data.proofRequestUrl;
      } else {
        console.error('Available fields in response:', Object.keys(data));
        throw new Error(`Missing proof request URL in backend response. Available fields: ${Object.keys(data).join(', ')}`);
      }
      
      // Deep link URL
      deepLinkURL = data.deepLinkUrl || proofRequestURL;
      
      console.log('Extracted values:');
      console.log('- Thread ID:', proofRequestThreadId);
      console.log('- Proof Request URL:', proofRequestURL);
      console.log('- Deep Link URL:', deepLinkURL);
      
      // STEP 3: Subscribe to webhook using the threadId via backend
      console.log('🔗 Subscribing to webhook for thread via backend:', proofRequestThreadId);
      try {
        // This still calls your backend's /api/ndi/webhook/subscribe endpoint
        await this.subscribeViaBackend(proofRequestThreadId);
        console.log('✅ Successfully subscribed to NDI webhook via backend');
      } catch (subscriptionError) {
        console.error('❌ Failed to subscribe to webhook via backend:', subscriptionError);
        // Don't throw here - let the auth continue, but log the error
        console.warn('Continuing with authentication despite webhook subscription failure');
      }
      
      return {
        proofRequestThreadId,
        proofRequestURL,
        deepLinkURL
      };
    } catch (error) {
      console.error('Error creating proof request:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to ${fullUrl}. Check if the backend is running and accessible.`);
      }
      
      throw error;
    }
  }

  /**
   * NEW METHOD: Subscribe to NDI webhook via backend
   * This avoids CORS issues by routing through your backend
   */
  async subscribeViaBackend(threadId: string): Promise<any> {
    console.log('Subscribing to NDI webhook via backend for thread:', threadId);
    
    try {
      // This calls your backend's /api/ndi/webhook/subscribe endpoint
      const response = await fetch(`${this.baseUrl}/api/ndi/webhook/subscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          threadId: threadId,
          webhookId: this.webhookId
        })
      });
      
      console.log('Backend webhook subscription response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend webhook subscription error:', errorText);
        throw new Error(`Failed to subscribe via backend: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Backend webhook subscription response:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('Error subscribing via backend:', error);
      throw error;
    }
  }

  async checkProofViaWebhook(threadId: string): Promise<ProofCheckResult> {
    // Check webhook endpoint first (this should be instant if webhook received the notification)
    const webhookUrl = `${this.baseUrl}/api/webhook/proof-status/${threadId}`;
    console.log('Checking webhook proof status at:', webhookUrl);
    
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      if (webhookResponse.ok) {
        const webhookData = await webhookResponse.json();
        console.log('Webhook proof check response:', webhookData);
        
        if (webhookData.success) {
          console.log('✅ Proof found via webhook!');
          return {
            success: true,
            presentation: webhookData.presentation
          };
        }
      } else if (webhookResponse.status === 404) {
        console.log('Webhook: Proof not ready yet (404)');
        return { success: false, presentation: null, error: "Proof not ready yet via webhook (404)" }; // Added error message
      }
      // Added a generic error return for non-200, non-404 responses or other issues
      const errorText = await webhookResponse.text();
      return { success: false, presentation: null, error: `Webhook check failed: ${webhookResponse.status} - ${errorText}` };
    } catch (webhookError: any) {
      console.error('Webhook check failed:', webhookError);
      return { success: false, presentation: null, error: `Webhook check network error: ${webhookError.message}` };
    }
  }

  async checkProofDirectAPI(threadId: string): Promise<ProofCheckResult> {
    // Direct API check as fallback (only use this if webhook is not working)
    // Reverted this URL to use the 'Auth' segment to match your backend's NdiService
    const directUrl = `${this.baseUrl}/api/Auth/ndi/proof-check/${threadId}`; 
    console.log('Checking proof via direct API at:', directUrl);
    
    try {
      const response = await fetch(directUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Direct API: Proof not ready yet (404)');
          return { success: false, presentation: null, error: "Proof not ready yet via direct API (404)" }; // Added error message
        }
        console.error('Direct API proof check failed:', response.status);
        const errorText = await response.text();
        console.error('Direct API error response:', errorText);
        return { success: false, presentation: null, error: `Direct API check failed: ${response.status} - ${errorText}` };
      }
      
      const data = await response.json();
      console.log('Direct API proof check response:', data);
      
      return {
        success: data.success || data.verified || data.completed || false,
        presentation: data.presentation || data.proof || data.data || null
      };
    } catch (error: any) {
      console.error('Error checking proof via direct API:', error);
      return { success: false, presentation: null, error: `Direct API check network error: ${error.message}` };
    }
  }

  async checkProof(threadId: string): Promise<ProofCheckResult> {
    // With webhooks, we primarily check the webhook endpoint
    // The webhook should have already received and stored the proof result
    const webhookResult = await this.checkProofViaWebhook(threadId);
    
    if (webhookResult.success) {
      return webhookResult;
    }
    
    // Only use direct API as fallback if webhook is not implemented/working
    // In production with webhooks, this should rarely be needed
    console.log('Webhook check unsuccessful, trying direct API as fallback...');
    return await this.checkProofDirectAPI(threadId);
  }

  async registerWebhook(request: WebhookRegistrationRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ndi/webhook/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to register webhook: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  }

  // DEPRECATED: Use subscribeViaBackend instead
  async subscribeThread(request: ProofSubscriptionRequest): Promise<any> {
    console.warn('subscribeThread is deprecated, use subscribeViaBackend instead');
    return this.subscribeViaBackend(request.threadId);
  }

  parseProofPresentation(payload: any): FoundationalId {
    try {
      console.log('Parsing proof presentation:', payload);
      
      // Handle different possible presentation formats
      let revealed: any;
      
      if (payload.requested_presentation?.revealed_attrs) {
        revealed = payload.requested_presentation.revealed_attrs;
      } else if (payload.presentation?.revealed_attrs) {
        revealed = payload.presentation.revealed_attrs;
      } else if (payload.revealed_attrs) {
        revealed = payload.revealed_attrs;
      } else if (payload.attributes) {
        revealed = payload.attributes;
      } else {
        console.error('No revealed attributes found. Payload structure:', Object.keys(payload));
        throw new Error('No revealed attributes found in presentation');
      }
      
      console.log('Revealed attributes:', revealed);
      
      // Try different possible field names for ID and Name
      let idNumber: string | undefined;
      let fullName: string | undefined;
      
      // Try various field names for ID Number
      if (revealed["ID Number"]?.[0]?.value) {
        idNumber = revealed["ID Number"][0].value;
      } else if (revealed["id_number"]?.[0]?.value) {
        idNumber = revealed["id_number"][0].value;
      } else if (revealed["citizenId"]?.[0]?.value) {
        idNumber = revealed["citizenId"][0].value;
      } else if (revealed["citizen_id"]?.[0]?.value) {
        idNumber = revealed["citizen_id"][0].value;
      }
      
      // Try various field names for Full Name
      if (revealed["Full Name"]?.[0]?.value) {
        fullName = revealed["Full Name"][0].value;
      } else if (revealed["full_name"]?.[0]?.value) {
        fullName = revealed["full_name"][0].value;
      } else if (revealed["name"]?.[0]?.value) {
        fullName = revealed["name"][0].value;
      } else if (revealed["fullName"]?.[0]?.value) {
        fullName = revealed["fullName"][0].value;
      }
      
      if (!idNumber || !fullName) {
        console.error('Available revealed attributes:', Object.keys(revealed));
        throw new Error(`Required attributes not found. Available: ${Object.keys(revealed).join(', ')}`);
      }
      
      return {
        idNumber: String(idNumber),
        fullName: String(fullName)
      };
    } catch (error) {
      console.error('Error parsing proof presentation:', error);
      throw new Error('Failed to parse proof presentation');
    }
  }

  // Utility method to setup webhook notifications (called from frontend if needed)
  async setupWebhookForThread(threadId: string): Promise<void> {
    try {
      // This now calls the backend subscription method
      console.log('Setting up webhook for thread:', threadId);
      await this.subscribeViaBackend(threadId);
    } catch (error) {
      console.error('Error setting up webhook for thread:', error);
      throw error;
    }
  }
}

export const ndiApiService = new NDIApiService();