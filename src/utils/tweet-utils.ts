export function getTweetUrl(tweetId: string, username?: string): string {
  // If username is not provided, use "i" which redirects to the correct user
  const user = username || "i";
  return `https://x.com/${user}/status/${tweetId}`;
}
