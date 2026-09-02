import type { DisplayOrdered } from "./common";

/** Cloudinary-backed image metadata persisted with content documents. */
export interface MediaImage {
  url: string;
  publicId?: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface OrderedMediaImage extends MediaImage, DisplayOrdered {}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}
