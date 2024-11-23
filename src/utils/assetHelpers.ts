export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // For development, prepend with /
  // For production, prepend with /pandemic-simulation/
  return import.meta.env.DEV ? `/${cleanPath}` : `/pandemic-simulation/${cleanPath}`;
} 