import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, CheckCircle, Clock, User, Shield, Mountain, RefreshCw, ExternalLink } from "lucide-react";
import { useNDIAuth } from "@/hooks/useNDIAuth";

interface NDILoginProps {
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
}

export const NDILogin: React.FC<NDILoginProps> = ({ onSuccess, onCancel }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    qrCode, 
    deepLinkURL,
    user, 
    error, 
    generateCredentialRequest, 
    logout,
    retryAuthentication
  } = useNDIAuth();

  React.useEffect(() => {
    if (isAuthenticated && user && onSuccess) {
      onSuccess(user);
    }
  }, [isAuthenticated, user, onSuccess]);

  if (isAuthenticated && user) {
    return (
      <Card className="max-w-md mx-auto border-2 border-green-200">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-green-800">NDI Authentication Successful</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{user.fullName}</span>
            </div>
            {user.institution && (
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.institution}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {user.verificationStatus}
              </Badge>
              {user.academicLevel && (
                <Badge variant="outline">
                  {user.academicLevel}
                </Badge>
              )}
            </div>
          </div>
          
          <Button 
            onClick={logout}
            variant="outline" 
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto border-2 border-orange-200">
      <CardHeader className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <Mountain className="h-8 w-8 text-orange-600" />
        </div>
        <CardTitle>Sign in with Bhutan NDI</CardTitle>
        <p className="text-sm text-gray-600">
          Use your National Digital Identity to access personalized learning experiences
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!qrCode && !isLoading && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>✓ Secure, privacy-preserving authentication</p>
              <p>✓ Access to personalized learning paths</p>
              <p>✓ Digital certificates and credentials</p>
              <p>✓ Progress tracking and achievements</p>
            </div>
            
            <Button 
              onClick={() => generateCredentialRequest()}
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isLoading}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate NDI Login QR Code
            </Button>
            
            {onCancel && (
              <Button 
                onClick={onCancel}
                variant="outline"
                className="w-full"
              >
                Continue without NDI
              </Button>
            )}
          </div>
        )}
        
        {isLoading && !qrCode && (
          <div className="text-center space-y-3">
            <div className="animate-spin h-8 w-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-600">Generating secure authentication request...</p>
          </div>
        )}
        
        {qrCode && (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <img 
                src={qrCode} 
                alt="NDI Authentication QR Code" 
                className="mx-auto border-2 border-gray-200 rounded-lg max-w-full h-auto"
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Scan with your NDI Wallet</p>
                <p className="text-xs text-gray-500">
                  Open your Bhutan NDI mobile wallet and scan this QR code to authenticate
                </p>
              </div>
            </div>
            
            {deepLinkURL && (
              <div className="text-center">
                <Button
                  onClick={() => window.open(deepLinkURL, '_blank')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in NDI Wallet
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Waiting for authentication...</span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={retryAuthentication}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
            
            <Alert>
              <AlertDescription className="text-xs">
                <strong>New to NDI?</strong> Download the Bhutan NDI wallet app from your app store and complete verification.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};