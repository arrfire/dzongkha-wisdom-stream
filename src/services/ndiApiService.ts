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
  }

  async createFoundationalIdProofRequest(): Promise<ProofRequestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/Auth/ndi/request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create proof request: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return {
        proofRequestThreadId: data.proofRequestThreadId,
        proofRequestURL: data.proofRequestURL,
        deepLinkURL: data.deepLinkURL
      };
    } catch (error) {
      console.error('Error creating proof request:', error);
      throw error;
    }
  }

  async checkProof(threadId: string): Promise<ProofCheckResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ndi/proof-check/${threadId}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, presentation: null };
        }
        throw new Error(`Failed to check proof: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: data.success || false,
        presentation: data.presentation || null
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
      // Parse the proof presentation based on your backend's format
      const revealed = payload.requested_presentation?.revealed_attrs;
      if (!revealed) {
        throw new Error('No revealed attributes found in presentation');
      }
      
      const idNumber = revealed["ID Number"]?.[0]?.value;
      const fullName = revealed["Full Name"]?.[0]?.value;
      
      if (!idNumber || !fullName) {
        throw new Error('Required attributes (ID Number, Full Name) not found in presentation');
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