import { supabase } from "./supabase";

const storageBucket =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "site-media";

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function uploadImageFile(file, { folder = "admin" } = {}) {
  if (!(file instanceof File)) {
    throw new Error("No file selected.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }

  const extension = file.name.includes(".")
    ? file.name.split(".").pop()
    : "png";
  const filePath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${sanitizeFileName(extension)}`;

  const { error: uploadError } = await supabase.storage
    .from(storageBucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(storageBucket).getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadImageFiles(files, { folder = "admin" } = {}) {
  const uploadedUrls = [];

  for (const file of files) {
    const publicUrl = await uploadImageFile(file, { folder });
    uploadedUrls.push(publicUrl);
  }

  return uploadedUrls;
}

export function getStoragePathFromUrl(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const marker = `/storage/v1/object/public/${storageBucket}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      parsedUrl.pathname.slice(markerIndex + marker.length),
    );
  } catch {
    return null;
  }
}

export async function deleteStorageFilesByUrls(urls) {
  const paths = urls
    .map((url) => getStoragePathFromUrl(url))
    .filter(Boolean);

  if (!paths.length) return;

  const { error } = await supabase.storage.from(storageBucket).remove(paths);

  if (error) {
    throw error;
  }
}

export function getStorageBucketName() {
  return storageBucket;
}
