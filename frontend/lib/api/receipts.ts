import { apiClient } from './client';

export interface ReceiptUploadResponse {
  uploadUrl: string;
  receiptUrl: string;
}

export interface ReceiptVerificationResponse {
  verified: boolean;
  confidence: number;
  message: string;
}

export const receiptsApi = {
  async getUploadUrl(contentType: string): Promise<ReceiptUploadResponse> {
    const response = await apiClient.post('/receipts/upload', {
      contentType,
    });
    return response.data;
  },

  async verifyReceipt(receiptUrl: string, expectedLocation?: string): Promise<ReceiptVerificationResponse> {
    const response = await apiClient.post('/receipts/verify', {
      receiptUrl,
      expectedLocation,
    });
    return response.data;
  },
};
