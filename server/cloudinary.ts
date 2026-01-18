import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export default cloudinary;

export const uploadToCloudinary = async (file: Buffer, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        public_id: `electrolight/products/${fileName}`,
        folder: 'electrolight/products',
        // CHANGE: Use 'limit' instead of 'fill' and increase dimensions.
        // 'limit' means: "Only resize if it's huge, but NEVER crop it."
        transformation: [
          { width: 1920, height: 1920, crop: 'limit', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    ).end(file);
  });
};

// New flexible media upload function for images and videos
export const uploadMediaToCloudinary = async (
  file: Buffer, 
  fileName: string, 
  fileType: string,
  folder: string = 'electrolight/projects'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Determine if this is a video or image
    const isVideo = fileType.startsWith('video/');
    
    const uploadOptions: any = {
      resource_type: isVideo ? 'video' : 'image',
      public_id: `${folder}/${fileName}`,
      folder: folder,
    };

    // Add transformations based on media type
    if (isVideo) {
      uploadOptions.eager = [
        { width: 1280, height: 720, crop: 'limit', quality: 'auto', format: 'mp4' }
      ];
      uploadOptions.eager_async = true;
    } else {
      uploadOptions.transformation = [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
      ];
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    ).end(file);
  });
};