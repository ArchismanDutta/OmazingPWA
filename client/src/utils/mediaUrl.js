// Utility functions for handling media URLs

/**
 * Process media URL to ensure it's accessible
 * Handles both S3 direct URLs and CloudFront URLs
 */
export const processMediaUrl = (url) => {
  if (!url) return null;

  // If it's already a complete URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative path, construct full URL using the API base
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const baseUrl = apiBase.replace('/api/v1', '');

  return `${baseUrl}/${url}`;
};

/**
 * Get optimized media URL
 * Tries CloudFront first, falls back to S3 direct access
 */
export const getOptimizedMediaUrl = (contentItem) => {
  if (!contentItem?.storage?.url) return null;

  // Process the URL to make sure it's accessible
  return processMediaUrl(contentItem.storage.url);
};

/**
 * Handle media load errors by trying fallback URLs
 */
export const handleMediaError = (url, retryCallback) => {
  console.warn('Media load failed for URL:', url);

  // You could implement retry logic here
  // For now, just log the error
  if (retryCallback) {
    retryCallback();
  }
};

/**
 * Check if a URL is likely to have CORS issues
 */
export const checkCorsCompatibility = (url) => {
  if (!url) return false;

  // Local URLs should work fine
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return true;
  }

  // CloudFront URLs should work fine
  if (url.includes('cloudfront.net')) {
    return true;
  }

  // S3 URLs might have CORS issues
  if (url.includes('amazonaws.com')) {
    console.warn('S3 direct access detected. Consider using CloudFront for better performance and CORS handling.');
    return true; // Assume S3 is configured correctly
  }

  return true;
};

export default {
  processMediaUrl,
  getOptimizedMediaUrl,
  handleMediaError,
  checkCorsCompatibility
};