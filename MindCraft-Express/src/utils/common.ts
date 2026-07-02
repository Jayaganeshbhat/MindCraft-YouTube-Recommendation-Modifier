export async function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function hasYouTubeScope(scopeString?: string): boolean {
  if (!scopeString) return false;
  return scopeString.split(/\s+/).includes("https://www.googleapis.com/auth/youtube.readonly");
}