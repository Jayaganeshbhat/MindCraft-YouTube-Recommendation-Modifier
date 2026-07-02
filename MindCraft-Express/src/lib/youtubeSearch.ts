import fetch from 'node-fetch';

export interface YouTubeVideo {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeApiError {
  error?: {
    message?: string;
    errors?: Array<{ reason?: string }>;
  };
}

interface YouTubeSearchApiResponse extends YouTubeApiError {
  items?: YouTubeVideo[];
}

export interface YouTubeSearchResult {
  ok: boolean;
  data?: YouTubeVideo[];
  error?: string;
  statusCode?: number;
}

/**
 * Search YouTube videos using a user's OAuth token
 */
async function searchYouTubeVideos(
  query: string,
  accessToken: string
): Promise<YouTubeSearchResult> {
  if (!query) return { ok: false, error: 'Missing query' };
  if (!accessToken) return { ok: false, error: 'Missing access token' };

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: query,
    maxResults: '5',
    order: 'relevance',
    videoDuration: 'any',
    relevanceLanguage: 'en',
    videoEmbeddable: 'true',
    safeSearch: 'moderate',
    fields:
      'items(id/videoId,snippet(title,description,thumbnails,channelTitle,publishedAt))',
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  const data = (await res.json()) as YouTubeSearchApiResponse;

  if (!res.ok) {
    console.error('YouTube API error:', data.error);
    return {
      ok: false,
      statusCode: res.status,
      error: data.error?.message || 'YouTube API failed',
    };
  }

  return {
    ok: true,
    statusCode: res.status,
    data: data.items ?? [],
  };
}

export interface YouTubeQueryResources {
  query: string;
  resources: YouTubeVideo[];
}

export interface YouTubeQueriesResult {
  ok: boolean;
  data?: YouTubeQueryResources[];
  error?: string; // optional extra info (e.g. partial due to quota)
}

/**
 * Takes youtubeSearchQueries (JSON/string/array) and accessToken,
 * runs YouTube search for each, and returns:
 *
 * [
 *   {
 *     "query": "Search Text",
 *     "resources": [ ...video items... ]
 *   }
 * ]
 *
 * Behavior:
 * - Stops on hard quota/rate errors (403/429 / quotaExceeded / rateLimitExceeded),
 *   returns whatever has been collected so far.
 * - If nothing could be fetched at all, returns ok: false with error.
 */
export async function fetchYouTubeResourcesForQueries(
  youtubeSearchQueries: unknown,
  accessToken: string
): Promise<YouTubeQueriesResult> {
  if (!accessToken) {
    return { ok: false, error: 'Missing access token' };
  }

  // 1. Normalize queries: accept JSON string or array
  let queries: string[] = [];

  if (Array.isArray(youtubeSearchQueries)) {
    queries = youtubeSearchQueries
      .filter((q): q is string => typeof q === 'string')
      .map((q) => q.trim())
      .filter(Boolean);
  } else if (typeof youtubeSearchQueries === 'string') {
    try {
      const parsed = JSON.parse(youtubeSearchQueries);
      if (Array.isArray(parsed)) {
        queries = parsed
          .filter((q): q is string => typeof q === 'string')
          .map((q) => q.trim())
          .filter(Boolean);
      }
    } catch {
      return {
        ok: false,
        error: 'Invalid youtubeSearchQueries JSON string',
      };
    }
  } else {
    return {
      ok: false,
      error: 'youtubeSearchQueries must be an array or JSON string',
    };
  }

  if (queries.length === 0) {
    return { ok: false, error: 'No search queries provided' };
  }

  const results: YouTubeQueryResources[] = [];
  let quotaOrRateError = false;

  // 2. Sequential calls:
  //    Safer for quota, and lets us stop as soon as we hit a hard error.
  for (const query of queries) {
    const res = await searchYouTubeVideos(query, accessToken);

    if (res.ok && res.data && res.data.length > 0) {
      results.push({
        query,
        resources: res.data,
      });
      continue;
    }

    if (!res.ok) {
      const msg = (res.error || '').toLowerCase();

      const isQuotaOrRateError =
        res.statusCode === 403 ||
        res.statusCode === 429 ||
        msg.includes('quota') ||
        msg.includes('rate limit');

      if (isQuotaOrRateError) {
        quotaOrRateError = true;
        // Stop further calls but keep whatever is collected so far
        break;
      }

      // For non-quota errors, just skip this query and continue
      // (You could log res.error here.)
    }
  }

  // 3. No usable results at all
  if (results.length === 0) {
    return {
      ok: false,
      error: quotaOrRateError
        ? 'YouTube quota or rate limit exceeded before any results could be fetched.'
        : 'No results could be fetched for any query.',
    };
  }

  // 4. Return partial or full results
  return {
    ok: true,
    data: results,
    ...(quotaOrRateError
      ? { error: 'Partial results returned due to YouTube quota or rate limit error.' }
      : {}),
  };
}
