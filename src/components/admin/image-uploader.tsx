"use client"

import * as React from "react"
import {
  ImagePlusIcon,
  LoaderCircleIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { firebaseAuth } from "@/firebase/config"
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/constants"
import { publicEnvironment } from "@/lib/env"
import { isSafeHttpUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

const MEDIA_OBJECT_PREFIX = "sketchplan"
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"])
const MAX_UPLOADER_COUNT = 30

interface ImageUploaderImage {
  alt: string
  height?: number
  publicId?: string
  url: string
  width?: number
}

interface ImageUploaderProps {
  className?: string
  description?: string
  disabled?: boolean
  label?: string
  maxCount?: number
  maxFileSizeBytes?: number
  multiple?: boolean
  onChange: (images: ImageUploaderImage[]) => void
  required?: boolean
  value?: readonly ImageUploaderImage[]
}

interface UploadTask {
  error?: string
  fileName: string
  id: string
  previewUrl: string
  progress: number
}

/** Shape returned by the media Worker after it writes the object to R2. */
interface MediaUploadPayload {
  bytes: number
  contentType: string
  key: string
  url: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readFileExtension(objectKey: string) {
  const match = /\.([a-z0-9]+)$/.exec(objectKey.toLocaleLowerCase("en-US"))
  return match ? match[1] : ""
}

function parseMediaUploadPayload(value: unknown): MediaUploadPayload | null {
  if (!isRecord(value)) {
    return null
  }

  const { url, key, contentType, bytes } = value

  let usesHttps = false
  try {
    usesHttps = typeof url === "string" && new URL(url).protocol === "https:"
  } catch {
    usesHttps = false
  }

  if (
    typeof url !== "string" ||
    !usesHttps ||
    !isSafeHttpUrl(url) ||
    !url.startsWith(`${publicEnvironment.mediaBaseUrl.replace(/\/+$/, "")}/`) ||
    typeof key !== "string" ||
    !key.startsWith(`${MEDIA_OBJECT_PREFIX}/`) ||
    key.includes("..") ||
    !ALLOWED_IMAGE_EXTENSIONS.has(readFileExtension(key)) ||
    typeof contentType !== "string" ||
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      contentType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
    ) ||
    typeof bytes !== "number" ||
    !Number.isFinite(bytes) ||
    bytes <= 0 ||
    bytes > MAX_IMAGE_SIZE_BYTES
  ) {
    return null
  }

  return { url, key, contentType, bytes }
}

function readUploadError(value: unknown) {
  if (!isRecord(value) || !isRecord(value.error)) {
    return null
  }

  return typeof value.error.message === "string"
    ? value.error.message.slice(0, 240)
    : null
}

function createSafeFileStem(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "")
  const safeStem = withoutExtension
    .normalize("NFKD")
    .replace(/\p{Mark}+/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)

  return safeStem || "image"
}

function createUniqueSuffix(file: File) {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12)
  }

  return `${file.lastModified.toString(36)}-${file.size.toString(36)}`
}

function createUploadId(file: File) {
  return `${createSafeFileStem(file.name)}-${createUniqueSuffix(file)}`
}

function normalizeMaximum(value: number | undefined, fallback: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback
  }

  return Math.min(MAX_UPLOADER_COUNT, Math.max(1, Math.floor(value)))
}

function normalizeMaximumBytes(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) {
    return MAX_IMAGE_SIZE_BYTES
  }

  return Math.min(MAX_IMAGE_SIZE_BYTES, Math.max(1, Math.floor(value)))
}

function validateImageFile(file: File, maximumBytes: number) {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
    )
  ) {
    return `${file.name}: choose a JPG, JPEG, PNG, or WebP image.`
  }

  if (file.size > maximumBytes) {
    const maximumMegabytes = Math.floor(maximumBytes / (1024 * 1024))
    return `${file.name}: image must be ${maximumMegabytes} MB or smaller.`
  }

  if (file.size === 0) {
    return `${file.name}: the selected file is empty.`
  }

  return null
}

/**
 * R2 stores bytes only, so intrinsic dimensions are measured in the browser
 * instead of being read back from the storage response.
 */
async function readImageDimensions(file: File) {
  if (typeof globalThis.createImageBitmap !== "function") {
    return null
  }

  try {
    const bitmap = await globalThis.createImageBitmap(file)
    const { width, height } = bitmap
    bitmap.close?.()
    return Number.isFinite(width) && Number.isFinite(height) && width > 0
      ? { width, height }
      : null
  } catch {
    return null
  }
}

function uploadImage(
  file: File,
  idToken: string,
  signal: AbortSignal,
  onProgress: (progress: number) => void
) {
  return new Promise<MediaUploadPayload>((resolve, reject) => {
    const request = new XMLHttpRequest()
    const abortRequest = () => request.abort()
    signal.addEventListener("abort", abortRequest, { once: true })

    request.open("POST", publicEnvironment.mediaUploadUrl)
    request.timeout = 120_000
    request.setRequestHeader("Authorization", `Bearer ${idToken}`)
    request.setRequestHeader("Content-Type", file.type)
    request.setRequestHeader("X-File-Name", createSafeFileStem(file.name))
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)))
      }
    })
    request.addEventListener("load", () => {
      signal.removeEventListener("abort", abortRequest)

      let response: unknown
      try {
        response = JSON.parse(request.responseText)
      } catch {
        reject(new Error("The upload service returned an unreadable response."))
        return
      }

      if (request.status < 200 || request.status >= 300) {
        reject(
          new Error(
            readUploadError(response) ??
              "The image could not be uploaded. Please try again."
          )
        )
        return
      }

      const parsed = parseMediaUploadPayload(response)
      if (!parsed) {
        reject(new Error("The upload service returned incomplete image details."))
        return
      }

      onProgress(100)
      resolve(parsed)
    })
    request.addEventListener("error", () => {
      signal.removeEventListener("abort", abortRequest)
      reject(new Error("The upload failed. Check your connection and try again."))
    })
    request.addEventListener("timeout", () => {
      signal.removeEventListener("abort", abortRequest)
      reject(new Error("The upload took too long. Please try again."))
    })
    request.addEventListener("abort", () => {
      signal.removeEventListener("abort", abortRequest)
      reject(new Error("Upload cancelled."))
    })
    request.send(file)
  })
}

function ImageUploader({
  className,
  description = "JPG, JPEG, PNG, or WebP. Up to 10 MB per image.",
  disabled = false,
  label = "Images",
  maxCount,
  maxFileSizeBytes,
  multiple = false,
  onChange,
  required = false,
  value = [],
}: ImageUploaderProps) {
  const inputId = React.useId()
  const [tasks, setTasks] = React.useState<UploadTask[]>([])
  const [validationErrors, setValidationErrors] = React.useState<string[]>([])
  const controllers = React.useRef(new Map<string, AbortController>())
  const previewUrls = React.useRef(new Set<string>())
  const valueRef = React.useRef<readonly ImageUploaderImage[]>(value)
  const effectiveMaxCount = multiple
    ? normalizeMaximum(maxCount, 10)
    : 1
  const effectiveMaxBytes = normalizeMaximumBytes(maxFileSizeBytes)
  const activeTaskCount = tasks.filter((task) => !task.error).length
  const availableSlots = Math.max(
    0,
    effectiveMaxCount - value.length - activeTaskCount
  )

  React.useEffect(() => {
    valueRef.current = value
  }, [value])

  React.useEffect(() => {
    const activeControllers = controllers.current
    const activePreviewUrls = previewUrls.current

    return () => {
      activeControllers.forEach((controller) => controller.abort())
      activePreviewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl))
      activeControllers.clear()
      activePreviewUrls.clear()
    }
  }, [])

  const removeTask = (taskId: string) => {
    controllers.current.get(taskId)?.abort()
    controllers.current.delete(taskId)
    setTasks((currentTasks) => {
      const task = currentTasks.find((candidate) => candidate.id === taskId)
      if (task) {
        URL.revokeObjectURL(task.previewUrl)
        previewUrls.current.delete(task.previewUrl)
      }
      return currentTasks.filter((candidate) => candidate.id !== taskId)
    })
  }

  const removeImage = (index: number) => {
    const nextImages = valueRef.current.filter(
      (_image, imageIndex) => imageIndex !== index
    )
    valueRef.current = nextImages
    onChange([...nextImages])
  }

  const startUpload = async (file: File) => {
    const id = createUploadId(file)
    const previewUrl = URL.createObjectURL(file)
    const controller = new AbortController()
    previewUrls.current.add(previewUrl)
    controllers.current.set(id, controller)
    setTasks((currentTasks) => [
      ...currentTasks,
      { id, fileName: file.name, previewUrl, progress: 0 },
    ])

    try {
      const currentUser = firebaseAuth.currentUser
      if (!currentUser) {
        throw new Error("Your session expired. Sign in again to upload images.")
      }

      const [idToken, dimensions] = await Promise.all([
        currentUser.getIdToken(),
        readImageDimensions(file),
      ])

      const result = await uploadImage(
        file,
        idToken,
        controller.signal,
        (progress) => {
          setTasks((currentTasks) =>
            currentTasks.map((task) =>
              task.id === id ? { ...task, progress } : task
            )
          )
        }
      )

      if (controller.signal.aborted) {
        return
      }

      const uploadedImage: ImageUploaderImage = {
        url: result.url,
        publicId: result.key,
        alt: "",
        ...(dimensions ?? {}),
      }
      const nextImages = [
        ...valueRef.current,
        uploadedImage,
      ].slice(0, effectiveMaxCount)
      valueRef.current = nextImages
      onChange(nextImages)
      removeTask(id)
    } catch (error) {
      if (controller.signal.aborted) {
        return
      }

      const message =
        error instanceof Error
          ? error.message
          : "The image could not be uploaded. Please try again."
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? { ...task, error: message } : task
        )
      )
    } finally {
      controllers.current.delete(id)
    }
  }

  const selectFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) {
      return
    }

    const files = Array.from(selectedFiles)
    const errors: string[] = []
    const validFiles = files.filter((file) => {
      const error = validateImageFile(file, effectiveMaxBytes)
      if (error) {
        errors.push(error)
        return false
      }
      return true
    })

    if (validFiles.length > availableSlots) {
      errors.push(
        `Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be added.`
      )
    }

    setValidationErrors(errors)
    validFiles.slice(0, availableSlots).forEach((file) => {
      void startUpload(file)
    })
  }

  return (
    <section
      data-slot="image-uploader"
      className={cn("space-y-4", className)}
      aria-labelledby={`${inputId}-label`}
    >
      <div className="space-y-1">
        <p id={`${inputId}-label`} className="text-sm font-medium">
          {label} {required && <span aria-hidden="true">*</span>}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>

      <div
        className={cn(
          "relative rounded-xl border border-dashed bg-muted/30 p-5 text-center transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
          availableSlots === 0 && "opacity-65"
        )}
      >
        <input
          id={inputId}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple={multiple}
          disabled={disabled || availableSlots === 0}
          className="sr-only"
          onChange={(event) => {
            selectFiles(event.target.files)
            event.target.value = ""
          }}
        />
        <ImagePlusIcon
          aria-hidden="true"
          className="mx-auto size-7 text-muted-foreground"
        />
        <p className="mt-2 text-sm font-medium">
          {availableSlots > 0
            ? `Choose ${multiple ? "images" : "an image"}`
            : "Maximum image count reached"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {value.length} of {effectiveMaxCount} attached
        </p>
        {availableSlots > 0 && (
          <label
            htmlFor={inputId}
            className="mt-3 inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Select {multiple ? "files" : "file"}
          </label>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <TriangleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <ul className="space-y-1">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(value.length > 0 || tasks.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {value.map((image, index) => (
            <figure key={`${image.url}-${index}`} className="overflow-hidden rounded-xl border bg-card">
              {/* Remote R2 URLs are served through the Cloudflare image pipeline. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || `Uploaded image ${index + 1}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="flex items-center justify-between gap-3 p-3">
                <span className="min-w-0 truncate text-xs text-muted-foreground">
                  {image.publicId || "Existing image"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label={`Remove image ${index + 1}`}
                  onClick={() => removeImage(index)}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </figcaption>
            </figure>
          ))}

          {tasks.map((task) => (
            <figure key={task.id} className="overflow-hidden rounded-xl border bg-card">
              {/* Blob previews are local browser resources and cannot use next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={task.previewUrl}
                alt=""
                className="aspect-[4/3] w-full object-cover opacity-70"
              />
              <figcaption className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-xs font-medium">
                    {task.fileName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Cancel upload for ${task.fileName}`}
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2Icon aria-hidden="true" />
                  </Button>
                </div>
                {task.error ? (
                  <p role="alert" className="text-xs leading-5 text-destructive">
                    {task.error}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <LoaderCircleIcon aria-hidden="true" className="size-3 animate-spin" />
                        Uploading
                      </span>
                      <span>{task.progress}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`Uploading ${task.fileName}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={task.progress}
                      className="h-1.5 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        Removing an image here only detaches it from this entry. It does not delete the object from R2.
      </p>
      <p className="sr-only" aria-live="polite">
        {value.length} image{value.length === 1 ? "" : "s"} attached. {activeTaskCount} uploading.
      </p>
    </section>
  )
}

export {
  ImageUploader,
  MEDIA_OBJECT_PREFIX,
  createSafeFileStem,
  normalizeMaximumBytes,
  parseMediaUploadPayload,
  validateImageFile,
  type ImageUploaderImage,
  type ImageUploaderProps,
}
