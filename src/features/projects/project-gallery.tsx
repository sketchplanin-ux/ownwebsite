"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon } from "lucide-react";

import { ResponsiveImage } from "@/components/website/responsive-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isSafeHttpUrl, isSafeRelativeUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import type { ProjectImage } from "@/types/project";

export interface ProjectGalleryProps {
  className?: string;
  images: readonly ProjectImage[];
  projectTitle: string;
}

interface OrderedGalleryImage {
  alt: string;
  displayOrder: number;
  originalIndex: number;
  url: string;
}

function hasUsableImage(source: string): boolean {
  return isSafeHttpUrl(source) || isSafeRelativeUrl(source);
}

export function ProjectGallery({
  className,
  images,
  projectTitle,
}: ProjectGalleryProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const title = projectTitle.trim() || "Project";
  const orderedImages = useMemo<OrderedGalleryImage[]>(
    () =>
      images
        .map((image, originalIndex) => ({
          alt: image.alt?.trim() || `${title} gallery image ${originalIndex + 1}`,
          displayOrder: Number.isFinite(image.displayOrder)
            ? image.displayOrder
            : originalIndex,
          originalIndex,
          url: image.url,
        }))
        .filter((image) => hasUsableImage(image.url))
        .sort(
          (first, second) =>
            first.displayOrder - second.displayOrder ||
            first.originalIndex - second.originalIndex,
        ),
    [images, title],
  );

  if (orderedImages.length === 0) {
    return null;
  }

  const safeSelectedIndex = Math.min(
    selectedIndex,
    Math.max(orderedImages.length - 1, 0),
  );
  const selectedImage = orderedImages[safeSelectedIndex];

  const showPrevious = () => {
    setSelectedIndex((current) =>
      current <= 0 ? orderedImages.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setSelectedIndex((current) =>
      current >= orderedImages.length - 1 ? 0 : current + 1,
    );
  };

  const handleLightboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
          className,
        )}
      >
        {orderedImages.map((image, index) => (
          <DialogTrigger key={`${image.url}-${image.originalIndex}`} asChild>
            <button
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-muted text-left outline-none ring-1 ring-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50",
                index === 0
                  ? "aspect-[16/10] sm:col-span-2 lg:row-span-2 lg:aspect-auto lg:min-h-[32rem]"
                  : "aspect-[4/3]",
              )}
              aria-label={`Open ${image.alt} in the image viewer`}
            >
              <ResponsiveImage
                src={image.url}
                alt={image.alt}
                sizes={
                  index === 0
                    ? "(min-width: 1024px) 66vw, 100vw"
                    : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                }
                widths={[320, 480, 640, 800, 1024, 1280]}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
              <span className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <ZoomInIcon aria-hidden="true" className="size-4" />
              </span>
            </button>
          </DialogTrigger>
        ))}
      </div>

      {selectedImage && (
        <DialogContent
          className="max-w-[calc(100%-1rem)] gap-3 bg-background p-3 sm:max-w-6xl"
          onKeyDown={handleLightboxKeyDown}
        >
          <DialogTitle className="sr-only">{selectedImage.alt}</DialogTitle>
          <DialogDescription className="sr-only">
            Project image {safeSelectedIndex + 1} of {orderedImages.length}. Use
            the left and right arrow keys to move between images.
          </DialogDescription>

          <div className="relative flex min-h-[50vh] items-center justify-center overflow-hidden rounded-lg bg-muted">
            <ResponsiveImage
              src={selectedImage.url}
              alt={selectedImage.alt}
              loading="eager"
              sizes="95vw"
              widths={[640, 960, 1280, 1600, 1920]}
              className="max-h-[78vh] w-auto object-contain"
            />

            {orderedImages.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-lg"
                  className="absolute left-3 shadow-md"
                  onClick={showPrevious}
                  aria-label="Show previous project image"
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-lg"
                  className="absolute right-3 shadow-md"
                  onClick={showNext}
                  aria-label="Show next project image"
                >
                  <ChevronRightIcon aria-hidden="true" />
                </Button>
              </>
            )}
          </div>

          <p className="px-1 pr-12 text-sm text-muted-foreground" aria-live="polite">
            {safeSelectedIndex + 1} of {orderedImages.length} — {selectedImage.alt}
          </p>
        </DialogContent>
      )}
    </Dialog>
  );
}
