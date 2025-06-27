
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, Smartphone, QrCode } from "lucide-react";
import { ndiApiService } from "@/services/ndiApiService";
import QRCode from 'qrcode';

interface CredentialVerificationProps {
  onVerificationComplete: (credentials: any[]) => void;
}

export const CredentialVerification: React.FC<CredentialVerificationProps> = ({
  onVerificationComplete
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'creating' | 'qr' | 'waiting' | 'complete'>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [proofRequestUrl, setProofRequestUrl] = useState<string>('');
  const [verifiedCredentials, setVerifiedCredentials] = useState<any[]>([]);

  const startVerification = async () => {
    setIsVerifying(true);
    setVerificationStep('creating');
    
    try {
      console.log('🔍 Starting credential verification process...');
      
      // Create proof request
      const proofRequest = await ndiApiService.createProofRequest();
      
      if (proofRequest.proofRequestUrl) {
        setProofRequestUrl(proofRequest.proofRequestUrl);
        
        // Generate QR code
        setVerificationStep('qr');
        const qrCodeImage = await QRCode.toDataURL(proofRequest.proofRequestUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCode(qrCodeImage);
        setVerificationStep('waiting');
        
        // In a real implementation, you would poll for verification completion
        // For now, we'll simulate the process
        setTimeout(() => {
          const mockCredentials = [
            {
              id: 'cred-1',
              type: 'EduStream Certificate',
              studentId: '12345',
              titleOfAward: 'Blockchain Fundamentals',
              issuer: 'EduStream',
              verified: true
            }
          ];
          
          setVerifiedCredentials(mockCredentials);
          setVerificationStep('complete');
          onVerificationComplete(mockCredentials);
        }, 10000); // Simulate 10 second verification
        
      } else {
        throw new Error('No proof request URL received');
      }
    } catch (error) {
      console.error('❌ Verification failed:', error);
      setVerificationStep('idle');
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setVerificationStep('idle');
    setIsVerifying(false);
    setQrCode(null);
    setProofRequestUrl('');
    setVerifiedCredentials([]);
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Verify Your NDI Credentials</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {verificationStep === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Verify your EduStream credentials stored in your NDI wallet to unlock exclusive rewards
            </p>
            <Button 
              onClick={startVerification}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isVerifying}
            >
              <Shield className="h-4 w-4 mr-2" />
              Check My Credentials
            </Button>
          </div>
        )}

        {verificationStep === 'creating' && (
          <div className="text-center space-y-4">
            <div className="animate-spin mx-auto">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-blue-600 font-medium">Creating verification request...</p>
          </div>
        )}

        {verificationStep === 'qr' && (
          <div className="text-center space-y-4">
            <p className="text-blue-600 font-medium">Generating QR code...</p>
          </div>
        )}

        {verificationStep === 'waiting' && qrCode && (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg inline-block">
              <img src={qrCode} alt="Verification QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Scan with NDI Wallet</span>
              </div>
              <p className="text-sm text-gray-600">
                Open your NDI wallet app and scan the QR code to verify your credentials
              </p>
              <div className="animate-pulse flex items-center justify-center space-x-2 mt-4">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600 text-sm">Waiting for verification...</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={resetVerification}
              className="mt-4"
            >
              Cancel Verification
            </Button>
          </div>
        )}

        {verificationStep === 'complete' && verifiedCredentials.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="font-bold">Verification Complete!</span>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Verified Credentials:</h4>
              {verifiedCredentials.map((credential, index) => (
                <div key={credential.id} className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-green-800">{credential.titleOfAward}</h5>
                      <p className="text-sm text-gray-600">
                        Student ID: {credential.studentId} | Issued by: {credential.issuer}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={resetVerification}
              variant="outline"
              className="w-full"
            >
              Verify Again
            </Button>
          </div>
        )}

        {verificationStep === 'complete' && verifiedCredentials.length === 0 && (
          <div className="text-center space-y-4">
            <p className="text-gray-600">No EduStream credentials found in your NDI wallet.</p>
            <p className="text-sm text-gray-500">
              Complete missions to earn credentials that can be verified here.
            </p>
            <Button 
              onClick={resetVerification}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CredentialVerification;
