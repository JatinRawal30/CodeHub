// Shrinks a photo in the browser before upload: a 5 MB phone photo becomes ~30–80 KB.
// Keeps the aspect ratio; only scales down, never up.
export async function resizeImage(file, maxSize = 512, quality = 0.85) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Browsers that can't encode WebP return PNG instead, which the upload also accepts
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process this image"))),
      "image/webp",
      quality
    )
  );
}
