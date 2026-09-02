import type { DisplayOrdered } from "./common";

/** R2-backed image metadata persisted with content documents. */
export interface MediaImage {
  url: string;
  /** R2 object key, e.g. `sketchplan/courtyard-a1b2c3d4e5f6.webp`. */
  publicId?: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface OrderedMediaImage extends MediaImage, DisplayOrdered {}

export interface MediaUploadResult {
  url: string;
  key: string;
  contentType: string;
  bytes: number;
}
