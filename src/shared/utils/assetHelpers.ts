export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Get the base URL from Vite
  const base = import.meta.env.BASE_URL;
  
  // Remove trailing slash from base if it exists
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  
  // Combine the paths ensuring single slash between segments
  return `${cleanBase}/${cleanPath}`;
}
