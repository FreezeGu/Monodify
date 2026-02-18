// ImgBB API Configuration
// API Documentation: https://api.imgbb.com/

export const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'ec6d406bcd83dd1635c04d9b274206ca';

// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data:image/...;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const uploadToImgBB = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  try {
    // Convert file to base64
    const base64Image = await fileToBase64(file);

    // ImgBB API expects form-urlencoded format for base64 uploads
    const params = new URLSearchParams();
    params.append('key', IMGBB_API_KEY);
    params.append('image', base64Image);

    // Upload to ImgBB
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      console.error('Failed to parse response:', text);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    // Check for API errors
    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('ImgBB API error:', data);
      throw new Error(errorMsg);
    }

    if (!data.success) {
      const errorMsg = data?.error?.message || data?.error || 'Upload failed - unknown error';
      console.error('ImgBB upload failed:', data);
      throw new Error(errorMsg);
    }

    if (!data.data || !data.data.url) {
      console.error('Invalid response from ImgBB:', data);
      throw new Error('Invalid response from image server');
    }

    return {
      url: data.data.url,
      displayUrl: data.data.display_url || data.data.url,
      deleteUrl: data.data.delete_url, // For future deletion if needed
      id: data.data.id,
      thumbUrl: data.data.thumb?.url, // Thumbnail URL if available
    };
  } catch (error) {
    console.error('ImgBB upload error:', error);
    // Re-throw with more context if it's not already an Error object
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || 'Failed to upload image to ImgBB');
  }
};
