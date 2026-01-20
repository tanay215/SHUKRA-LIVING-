import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Image optimization configurations
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 }
};

const QUALITY_SETTINGS = {
  jpeg: { quality: 85, progressive: true },
  webp: { quality: 80, effort: 4 },
  png: { compressionLevel: 8, progressive: true }
};

export class ImageOptimizer {
  constructor(uploadDir = 'uploads/images') {
    this.uploadDir = uploadDir;
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async optimizeImage(inputBuffer, filename, options = {}) {
    const { 
      generateSizes = true, 
      format = 'webp',
      quality = 80 
    } = options;

    const baseName = path.parse(filename).name;
    const results = {};

    try {
      // Generate different sizes
      for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
        const outputFilename = `${baseName}_${sizeName}.${format}`;
        const outputPath = path.join(this.uploadDir, outputFilename);

        let pipeline = sharp(inputBuffer)
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'center'
          });

        // Apply format-specific optimizations
        switch (format) {
          case 'webp':
            pipeline = pipeline.webp(QUALITY_SETTINGS.webp);
            break;
          case 'jpeg':
          case 'jpg':
            pipeline = pipeline.jpeg(QUALITY_SETTINGS.jpeg);
            break;
          case 'png':
            pipeline = pipeline.png(QUALITY_SETTINGS.png);
            break;
        }

        await pipeline.toFile(outputPath);
        
        results[sizeName] = {
          filename: outputFilename,
          path: outputPath,
          url: `/images/${outputFilename}`,
          size: dimensions
        };
      }

      return results;
    } catch (error) {
      console.error('Image optimization error:', error);
      throw new Error('Failed to optimize image');
    }
  }

  async deleteOptimizedImages(imageUrls) {
    try {
      for (const url of imageUrls) {
        const filename = path.basename(url);
        const filePath = path.join(this.uploadDir, filename);
        
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.warn(`Failed to delete image: ${filePath}`, error.message);
        }
      }
    } catch (error) {
      console.error('Error deleting optimized images:', error);
    }
  }

  // Generate responsive image srcset
  generateSrcSet(baseUrl, sizes = ['small', 'medium', 'large']) {
    return sizes
      .map(size => `${baseUrl}_${size}.webp ${IMAGE_SIZES[size].width}w`)
      .join(', ');
  }

  // Get image metadata
  async getImageMetadata(inputBuffer) {
    try {
      const metadata = await sharp(inputBuffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha
      };
    } catch (error) {
      throw new Error('Failed to get image metadata');
    }
  }

  // Validate image
  validateImage(buffer, maxSize = 5 * 1024 * 1024) { // 5MB default
    if (buffer.length > maxSize) {
      throw new Error(`Image size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check if it's a valid image by trying to get metadata
    return sharp(buffer).metadata();
  }
}

export const imageOptimizer = new ImageOptimizer();