'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { locationsApi } from '@/lib/api/locations';
import { reviewsApi } from '@/lib/api/reviews';
import { receiptsApi } from '@/lib/api/receipts';
import { Star, Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MENU_ITEMS = [
  { id: 'chicken-burrito', name: 'Chicken Burrito' },
  { id: 'chicken-bowl', name: 'Chicken Bowl' },
  { id: 'steak-burrito', name: 'Steak Burrito' },
  { id: 'steak-bowl', name: 'Steak Bowl' },
  { id: 'carnitas-burrito', name: 'Carnitas Burrito' },
  { id: 'carnitas-bowl', name: 'Carnitas Bowl' },
  { id: 'barbacoa-burrito', name: 'Barbacoa Burrito' },
  { id: 'barbacoa-bowl', name: 'Barbacoa Bowl' },
  { id: 'veggie-bowl', name: 'Veggie Bowl' },
  { id: 'chicken-tacos', name: 'Chicken Tacos' },
];

export default function NewReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get('locationId');

  const [formData, setFormData] = useState({
    menuItem: '',
    rating: 5,
    comment: '',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Fetch location details
  const { data: location, isLoading: locationLoading } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => locationsApi.getById(locationId!),
    enabled: !!locationId,
  });

  // Upload receipt mutation
  const uploadReceiptMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadStatus('uploading');
      const { uploadUrl, receiptUrl } = await receiptsApi.getUploadUrl(file.type);

      // Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      return receiptUrl;
    },
    onSuccess: () => {
      setUploadStatus('success');
    },
    onError: () => {
      setUploadStatus('error');
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (receiptUrl?: string) => {
      return reviewsApi.create({
        locationId: locationId!,
        menuItem: formData.menuItem,
        rating: formData.rating,
        comment: formData.comment,
        receiptUrl,
      });
    },
    onSuccess: (data) => {
      // Redirect to location page
      router.push(`/locations/${locationId}?reviewAdded=true&points=${data.pointsEarned}`);
    },
  });

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let receiptUrl: string | undefined;

    // Upload receipt if provided
    if (receiptFile) {
      try {
        receiptUrl = await uploadReceiptMutation.mutateAsync(receiptFile);
      } catch (error) {
        console.error('Receipt upload failed:', error);
        // Continue without receipt
      }
    }

    // Submit review
    submitReviewMutation.mutate(receiptUrl);
  };

  if (!locationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 mb-4">No location selected</p>
          <Link href="/map" className="text-blue-600 hover:underline">
            Back to Map
          </Link>
        </div>
      </div>
    );
  }

  if (locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/locations/${locationId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Location
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
          <p className="text-gray-600 mb-6">{location?.name}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Menu Item Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Menu Item *
              </label>
              <select
                required
                value={formData.menuItem}
                onChange={(e) => setFormData({ ...formData, menuItem: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a menu item...</option>
                {MENU_ITEMS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating * ({formData.rating}/10)
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className={`w-10 h-10 rounded-lg border-2 font-semibold transition-all ${
                      rating <= formData.rating
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-400 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={4}
                placeholder="What did you think? Any tips for others?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Share your thoughts on taste, portion size, value, etc.
              </p>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Receipt (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {receiptPreview ? (
                  <div className="space-y-4">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="max-h-48 mx-auto rounded"
                    />
                    <div className="flex items-center justify-center space-x-2">
                      {uploadStatus === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {uploadStatus === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm text-gray-600">{receiptFile?.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptFile(null);
                        setReceiptPreview(null);
                        setUploadStatus('idle');
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      <label
                        htmlFor="receipt-upload"
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Click to upload
                      </label>{' '}
                      or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, or HEIC up to 10MB
                    </p>
                    <input
                      id="receipt-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/heic"
                      onChange={handleReceiptChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Earn 10 points with receipt verification!
                    </p>
                    <p className="text-sm text-green-700">
                      Upload your receipt to verify your visit and earn double points.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitReviewMutation.isPending || !formData.menuItem}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {submitReviewMutation.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>

            {/* Error Message */}
            {submitReviewMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Failed to submit review</p>
                    <p className="text-sm text-red-700">
                      Please try again or contact support if the problem persists.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Tips Sidebar */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for Great Reviews</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Be specific about what you liked or didn't like</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Mention portion size, temperature, and freshness</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Upload your receipt to verify and earn double points</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Compare to other locations if you've visited multiple</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
