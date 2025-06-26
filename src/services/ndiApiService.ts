import { 
  ProofRequestResult, 
  ProofCheckResult, 
  FoundationalId,
  WebhookRegistrationRequest,
  ProofSubscriptionRequest 
} from '@/types/ndi';

class NDIApiService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_NDI_BACKEND_URL || '/api';
    console.log('NDI Backend URL:', this.baseUrl);
  }

  async createFoundationalIdProofRequest(): Promise<ProofRequestResult> {
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
        return { success: false, presentation: null };
      }
    } catch (webhookError) {
      console.error('Webhook check failed:', webhookError);
    }
    
    return { success: false, presentation: null };
  }

  async checkProofDirectAPI(threadId: string): Promise<ProofCheckResult> {
    // Direct API check as fallback (only use this if webhook is not working)
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
          return { success: false, presentation: null };
        }
        console.error('Direct API proof check failed:', response.status);
        const errorText = await response.text();
        console.error('Direct API error response:', errorText);
        return { success: false, presentation: null };
      }
      
      const data = await response.json();
      console.log('Direct API proof check response:', data);
      
      return {
        success: data.success || data.verified || data.completed || false,
        presentation: data.presentation || data.proof || data.data || null
      };
    } catch (error) {
      console.error('Error checking proof via direct API:', error);
      return { success: false, presentation: null };
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

  async subscribeThread(request: ProofSubscriptionRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ndi/subscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to subscribe to thread: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error subscribing to thread:', error);
      throw error;
    }
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
      // This would typically be handled by your backend automatically
      // but you can call this from frontend if needed
      console.log('Setting up webhook for thread:', threadId);
      
      // The backend should handle webhook registration and subscription
      // This is just a placeholder if you need frontend control
    } catch (error) {
      console.error('Error setting up webhook for thread:', error);
    }
  }
}

export const ndiApiService = new NDIApiService();