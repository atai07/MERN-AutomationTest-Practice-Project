/**
 * Helper function to get the full URL for profile images
 * Handles both absolute URLs and relative paths from the backend
 */
export const getProfileImageUrl = (profileImage?: string): string => {
  if (!profileImage) return '';
  
  // If it's already a full URL (starts with http), return as is
  if (profileImage.startsWith('http')) return profileImage;
  
  // For relative paths, prepend the backend base URL (without /api)
  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${profileImage}`;
};
