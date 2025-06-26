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
      
      // Handle different possible response formats
      let proofRequestThreadId: string;
      let proofRequestURL: string;
      let deepLinkURL: string;
      
      // Try different possible field names for threadId
      if (data.proofRequestThreadId) {
        proofRequestThreadId = data.proofRequestThreadId;
      } else if (data.threadId) {
        proofRequestThreadId = data.threadId;
      } else if (data.id) {
        proofRequestThreadId = data.id;
      } else if (data.requestId) {
        proofRequestThreadId = data.requestId;
      } else if (data.proof_request_thread_id) {
        proofRequestThreadId = data.proof_request_thread_id;
      } else {
        console.error('Available fields in response:', Object.keys(data));
        throw new Error(`Missing proof request thread ID in backend response. Available fields: ${Object.keys(data).join(', ')}`);
      }
      
      // Try different possible field names for URL
      if (data.proofRequestURL) {
        proofRequestURL = data.proofRequestURL;
      } else if (data.proofRequestUrl) {
        proofRequestURL = data.proofRequestUrl;
      } else if (data.url) {
        proofRequestURL = data.url;
      } else if (data.requestUrl) {
        proofRequestURL = data.requestUrl;
      } else if (data.qrCodeUrl) {
        proofRequestURL = data.qrCodeUrl;
      } else if (data.proof_request_url) {
        proofRequestURL = data.proof_request_url;
      } else {
        console.error('Available fields in response:', Object.keys(data));
        throw new Error(`Missing proof request URL in backend response. Available fields: ${Object.keys(data).join(', ')}`);
      }
      
      // Deep link URL is optional
      deepLinkURL = data.deepLinkURL || data.deepLinkUrl || data.deepLink || data.deep_link_url || proofRequestURL;
      
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
      
      // Check if it's a CORS error
      if (error instanceof TypeError && error.message.includes('CORS')) {
        throw new Error(`CORS error: Backend at ${fullUrl} is not allowing requests from this domain.`);
      }
      
      throw error;
    }
  }

  async checkProof(threadId: string): Promise<ProofCheckResult> {
    // First try the webhook endpoint (faster)
    try {
      const webhookUrl = `${this.baseUrl}/api/webhook/proof-status/${threadId}`;
      console.log('Checking webhook proof status at:', webhookUrl);
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      if (webhookResponse.ok) {
        const webhookData = await webhookResponse.json();
        console.log('Webhook proof check response:', webhookData);
        return {
          success: webhookData.success || false,
          presentation: webhookData.presentation || null
        };
      }
    } catch (webhookError) {
      console.log('Webhook check failed, falling back to direct API:', webhookError);
    }

    // Fallback to direct API check
    const fallbackUrl = `${this.baseUrl}/api/Auth/ndi/check/${threadId}`;
    console.log('Checking proof at fallback URL:', fallbackUrl);
    
    try {
      const response = await fetch(fallbackUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Proof not ready yet (404)');
          return { success: false, presentation: null };
        }
        console.error('Proof check failed:', response.status);
        const errorText = await response.text();
        console.error('Proof check error response:', errorText);
        throw new Error(`Failed to check proof: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fallback proof check response:', data);
      
      return {
        success: data.success || data.verified || data.completed || false,
        presentation: data.presentation || data.proof || data.data || null
      };
    } catch (error) {
      console.error('Error checking proof:', error);
      return { success: false, presentation: null };
    }
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
}

export const ndiApiService = new NDIApiService();