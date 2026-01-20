import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export default cloudinary;

// ---------- Helpers ----------
function stripExtension(name: string) {
  return name.replace(/\.[^/.]+$/, "");
}

// Make a Cloudinary-safe public_id (letters/numbers/_/- only)
function makeSafePublicId(input: string) {
  const base = stripExtension(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-zA-Z0-9_-]+/g, "-") // replace bad chars
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");

  // fallback if it becomes empty
  const safe = base || `asset-${Date.now()}-${randomUUID()}`;

  // avoid insane length
  return safe.slice(0, 120);
}

// ---------- URL parsing + delete (keep your existing delete code) ----------
function parseCloudinaryUrl(
  url: string
): { publicId: string; resourceType: "image" | "video" | "raw" } | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);

    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;

    const resourceCandidate = parts[1];
    const resourceType: "image" | "video" | "raw" =
      resourceCandidate === "video" || resourceCandidate === "raw" || resourceCandidate === "image"
        ? resourceCandidate
        : "image";

    let afterUpload = parts.slice(uploadIndex + 1);

    const versionIndex = afterUpload.findIndex((p) => /^v\d+$/.test(p));
    if (versionIndex !== -1) {
      afterUpload = afterUpload.slice(versionIndex + 1);
    } else {
      while (afterUpload.length && (afterUpload[0].includes(",") || afterUpload[0].includes("_"))) {
        afterUpload.shift();
      }
    }

    if (!afterUpload.length) return null;

    const joined = decodeURIComponent(afterUpload.join("/"));
    const publicId = joined.replace(/\.[^/.]+$/, "");

    return { publicId, resourceType };
  } catch {
    return null;
  }
}

function guessResourceTypeFromUrl(url: string): "video" | "image" | "raw" {
  const lower = url.toLowerCase();
  if (lower.match(/\.(mp4|mov|webm|mkv|avi)(\?|$)/)) return "video";

  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const rt = parts[1];
    if (rt === "video" || rt === "image" || rt === "raw") return rt;
  } catch {}

  return "image";
}

export async function deleteFromCloudinaryByUrl(url?: string | null): Promise<void> {
  if (!url) return;

  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return;

  const { publicId } = parsed;

  const firstGuess = guessResourceTypeFromUrl(url);
  const tryTypes: Array<"video" | "image" | "raw"> =
    firstGuess === "video"
      ? ["video", "image", "raw"]
      : firstGuess === "raw"
      ? ["raw", "video", "image"]
      : ["image", "video", "raw"];

  for (const resource_type of tryTypes) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type,
        invalidate: true,
      });

      if ((result as any)?.result === "ok") return;
    } catch {}
  }
}

export async function deleteManyFromCloudinaryByUrls(
  urls: (string | null | undefined)[]
): Promise<void> {
  const unique = Array.from(new Set(urls.filter(Boolean) as string[]));
  if (!unique.length) return;
  await Promise.allSettled(unique.map((u) => deleteFromCloudinaryByUrl(u)));
}

// ---------- Uploads (FIXED) ----------
export const uploadToCloudinary = async (file: Buffer, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // IMPORTANT: sanitize / generate a safe id
    const safeId = makeSafePublicId(`${Date.now()}-${fileName}`);

    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "electrolight/products",
          public_id: safeId, // ✅ safe
          transformation: [{ width: 1920, height: 1920, crop: "limit", quality: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result?.secure_url || "");
        }
      )
      .end(file);
  });
};

export const uploadMediaToCloudinary = async (
  file: Buffer,
  fileName: string,
  fileType: string,
  folder: string = "electrolight/projects"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const isVideo = fileType.startsWith("video/");
    const safeId = makeSafePublicId(`${Date.now()}-${fileName}`);

    const uploadOptions: any = {
      resource_type: isVideo ? "video" : "image",
      folder,
      public_id: safeId, // ✅ safe
    };

    if (isVideo) {
      uploadOptions.eager = [{ width: 1280, height: 720, crop: "limit", quality: "auto", format: "mp4" }];
      uploadOptions.eager_async = true;
    } else {
      uploadOptions.transformation = [{ width: 1200, height: 800, crop: "limit", quality: "auto" }];
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || "");
      })
      .end(file);
  });
};
