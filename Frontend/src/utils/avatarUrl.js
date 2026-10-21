// Asks Cloudinary for a version of the avatar sized for where it's shown.
// avatarUrl(url, 32) → 64×64 (sharp on high-DPI screens), cropped around the face,
// in the best format the browser supports (AVIF/WebP) at automatic quality.
// Non-Cloudinary URLs are returned unchanged.
export function avatarUrl(url, size = 80) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const px = size * 2;
  return url.replace("/upload/", `/upload/c_fill,g_face,w_${px},h_${px},f_auto,q_auto/`);
}
