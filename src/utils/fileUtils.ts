// File compression and handling utilities

export interface CompressedFile {
  file: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

// Compress image file to under 500KB
export const compressImage = async (file: File, maxSizeKB: number = 500): Promise<CompressedFile> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions to maintain aspect ratio
      const maxWidth = 1200;
      const maxHeight = 1200;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Try different quality levels to get under maxSizeKB
      const tryCompress = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const sizeKB = blob.size / 1024;
            const originalSizeKB = file.size / 1024;

            if (sizeKB <= maxSizeKB || quality <= 0.1) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve({
                file,
                compressedFile,
                originalSize: originalSizeKB,
                compressedSize: sizeKB,
                compressionRatio: (1 - sizeKB / originalSizeKB) * 100,
              });
            } else {
              // Try with lower quality
              tryCompress(quality - 0.1);
            }
          },
          file.type,
          quality
        );
      };

      tryCompress(0.8); // Start with 80% quality
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Validate file type for business certificate
export const validateBusinessCertificate = (file: File): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  return allowedTypes.includes(file.type);
};

// Validate image file type
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};

// Get file size in KB
export const getFileSizeKB = (file: File): number => {
  return file.size / 1024;
};

// Format file size for display
export const formatFileSize = (sizeKB: number): string => {
  if (sizeKB < 1024) {
    return `${sizeKB.toFixed(1)} KB`;
  }
  return `${(sizeKB / 1024).toFixed(1)} MB`;
};
