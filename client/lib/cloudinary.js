import imageCompression from 'browser-image-compression';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;

export const validateImageFile = (file) => {
  if (!file) {
    throw new Error('Please select an image');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Use jpg, png, or webp');
  }

  const fileSizeMb = file.size / (1024 * 1024);
  if (fileSizeMb > MAX_FILE_SIZE_MB) {
    throw new Error(`Image must be less than ${MAX_FILE_SIZE_MB}MB`);
  }
};

const compressImageIfNeeded = async (file) => {
  const options = {
    maxSizeMB: 1.2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type === 'image/png' ? 'image/png' : 'image/webp',
  };

  return imageCompression(file, options);
};

export const uploadImageToCloudinary = async (file, options = {}) => {
  const { onProgress, folder = 'blog-app' } = options;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are missing');
  }

  validateImageFile(file);
  const optimizedFile = await compressImageIfNeeded(file);

  const formData = new FormData();
  formData.append('file', optimizedFile);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}');
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(data.error?.message || 'Image upload failed'));
          return;
        }

        resolve(data.secure_url);
      } catch {
        reject(new Error('Image upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Image upload failed'));
    xhr.send(formData);
  });
};
