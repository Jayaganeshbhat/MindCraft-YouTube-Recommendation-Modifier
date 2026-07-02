import { Router, Request, Response } from 'express';
import { ensureGoogleSession } from '../auth/ensureGoogleSession';

type RawHistoryItem = {
  title?: string;
  titleUrl?: string;
  time?: string;
  subtitles?: { name?: string; url?: string }[];
  details?: { name?: string }[];
};

type ProcessedHistoryItem = {
  title: string;
  url?: string;
  channel: string;
  watchedAt: string; // ISO string
};

function extractChannel(item: RawHistoryItem): string {
  // 0) Try to extract from YouTube URL query (e.g., &ab_channel=ChannelName)
  if (item.titleUrl) {
    try {
      const u = new URL(item.titleUrl);
      const abChannel = u.searchParams.get('ab_channel');
      if (abChannel && abChannel.trim()) {
        return decodeURIComponent(abChannel).trim();
      }
    } catch {
      // ignore bad URLs
    }
  }

  // Prefer subtitles when present
  const subs = Array.isArray(item.subtitles) ? item.subtitles : [];
  if (subs.length > 0) {
    const isGenericName = (name?: string) => {
      const n = (name || '').trim().toLowerCase();
      return n === '' || n === 'youtube' || n === 'google' || n === 'google ads';
    };

    // 1) If any subtitle has an explicit channelish URL, use its name (or derive handle)
    const channelish = subs.find((s) => {
      const u = (s.url || '').toLowerCase();
      return (
        u.includes('/channel/') ||
        u.includes('/user/') ||
        u.includes('/c/') ||
        u.includes('/@')
      );
    });
    if (channelish) {
      if (!isGenericName(channelish.name)) return channelish.name!.trim();
      const handleFromUrl = (channelish.url || '').match(/\/@([^/?#]+)/);
      if (handleFromUrl) return `@${handleFromUrl[1]}`;
    }

    // 2) If any subtitle has a non-generic, non-empty name, prefer the last one (often the channel)
    const named = subs.filter((s) => !isGenericName(s.name));
    if (named.length > 0) return named[named.length - 1]!.name!.trim();

    // 3) As a last attempt, try to derive a handle from a URL like /@channel
    const withUrl = subs.find((s) => (s.url || '').trim().length > 0);
    if (withUrl?.url) {
      const handleMatch = withUrl.url.match(/\/@([^/?#]+)/);
      if (handleMatch) return `@${handleMatch[1]}`;
    }
  }

  // Fallbacks using details field: sometimes contains "by <Channel>"
  const details = Array.isArray(item.details) ? item.details : [];
  if (details.length > 0) {
    const by = details.find((d) => (d.name || '').toLowerCase().startsWith('by '));
    if (by?.name) return by.name.replace(/^by\s+/i, '').trim();
  }

  // Parse from title patterns
  const title = item.title || '';
  // "Watched <Video> by <Channel>"
  const byMatch = title.match(/\bby\s+([^-–—|]+)$/i);
  if (byMatch) return byMatch[1].trim();
  // "Watched <Video> from <Channel>"
  const fromMatch = title.match(/\bfrom\s+([^-–—|]+)$/i);
  if (fromMatch) return fromMatch[1].trim();

  return 'Unknown';
}

function extractTitle(item: RawHistoryItem): string {
  // Title may be like "Watched X"
  const title = item.title || '';
  const watchedPrefix = title.match(/^watched\s+/i) ? title.replace(/^watched\s+/i, '') : title;
  // Remove trailing " by Channel" if present
  let cleaned = watchedPrefix.replace(/\s+by\s+[^-–—|]+$/i, '').trim();
  // Remove trailing " from Channel" if present
  cleaned = cleaned.replace(/\s+from\s+[^-–—|]+$/i, '').trim();
  return cleaned || 'Untitled';
}

function extractWatchedAt(item: RawHistoryItem): string {
  const t = item.time || '';
  const d = new Date(t);
  if (!isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

export const watchHistory = Router();

watchHistory.post(
  '/watch-history/process',
  ensureGoogleSession,
  async (req: Request, res: Response) => {
    try {
      const items = (req.body?.items || req.body) as RawHistoryItem[] | undefined;
      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payload. Expected an array of history items or { items: [] }',
        });
      }

      const processed: ProcessedHistoryItem[] = items.map((it) => ({
        title: extractTitle(it),
        url: it.titleUrl,
        channel: extractChannel(it),
        watchedAt: extractWatchedAt(it),
      }));

      // Sort desc by watchedAt
      processed.sort((a, b) => (a.watchedAt < b.watchedAt ? 1 : -1));

      // Fallback enrichment via YouTube oEmbed for items with Unknown channel and a YouTube URL
      const toEnrich = processed
        .filter(
          (p) =>
            p.channel === 'Unknown' &&
            p.url &&
            /(youtube\.com|youtu\.be)/i.test(p.url),
        )
        .slice(0, 50); // cap to avoid excessive outbound requests

      if (toEnrich.length > 0) {
        await Promise.all(
          toEnrich.map(async (p) => {
            try {
              const oembedUrl = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(
                p.url!,
              )}`;
              const resp = await fetch(oembedUrl, {
                // 3s timeout using AbortController
                signal: (() => {
                  const ac = new AbortController();
                  setTimeout(() => ac.abort(), 3000);
                  return ac.signal;
                })(),
              } as any);
              if (resp.ok) {
                const data = (await resp.json()) as {
                  author_name?: string;
                  author_url?: string;
                  title?: string;
                };
                if (data?.author_name) {
                  p.channel = data.author_name;
                } else if (data?.author_url) {
                  // Try to derive from author_url: /@handle or /channel/UC...
                  const handle = data.author_url.match(/\/@([^/?#]+)/);
                  if (handle) {
                    p.channel = `@${handle[1]}`;
                  } else {
                    const chid = data.author_url.match(/\/channel\/([^/?#]+)/);
                    if (chid) {
                      p.channel = chid[1];
                    }
                  }
                }
                // If oEmbed title is better, adopt it
                if (data?.title && (!p.title || p.title === 'Untitled')) {
                  p.title = data.title;
                }
              } else {
                console.warn('[watch-history] oEmbed failed', {
                  urlTried: p.url,
                  status: resp.status,
                  statusText: resp.statusText,
                });
                // Fallback to Noembed if YouTube oEmbed fails
                try {
                  const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(
                    p.url!,
                  )}`;
                  const r2 = await fetch(noembedUrl, {
                    signal: (() => {
                      const ac = new AbortController();
                      setTimeout(() => ac.abort(), 3000);
                      return ac.signal;
                    })(),
                  } as any);
                  if (r2.ok) {
                    const d2 = (await r2.json()) as {
                      author_name?: string;
                      title?: string;
                    };
                    if (d2?.author_name) p.channel = d2.author_name;
                    if (d2?.title && (!p.title || p.title === 'Untitled')) {
                      p.title = d2.title;
                    }
                  } else {
                    console.warn('[watch-history] Noembed failed', {
                      urlTried: p.url,
                      status: r2.status,
                      statusText: r2.statusText,
                    });
                  }
                } catch {
                  // ignore
                }

                // Final fallback: fetch watch page HTML and parse channel name heuristically
                if (p.channel === 'Unknown') {
                  try {
                    const r3 = await fetch(p.url!, {
                      headers: {
                        // Pretend to be a browser to increase chance of HTML response
                        'User-Agent':
                          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                      },
                      signal: (() => {
                        const ac = new AbortController();
                        setTimeout(() => ac.abort(), 3000);
                        return ac.signal;
                      })(),
                    } as any);
                    if (r3.ok) {
                      const html = await r3.text();
                      // Try several patterns commonly present in YouTube initial data
                      const ownerNameMatch =
                        html.match(/"ownerChannelName":"([^"]+)"/) ||
                        html.match(/"author":"([^"]+)"/);
                      if (ownerNameMatch && ownerNameMatch[1]) {
                        p.channel = ownerNameMatch[1];
                      } else {
                        const metaNameMatch = html.match(
                          /<link[^>]*itemprop="name"[^>]*content="([^"]+)"/i,
                        );
                        if (metaNameMatch && metaNameMatch[1]) {
                          p.channel = metaNameMatch[1];
                        } else {
                          // Try to extract channelId then resolve via Noembed
                          const channelIdMatch = html.match(/"channelId":"(UC[0-9A-Za-z_-]{10,})"/);
                          if (channelIdMatch && channelIdMatch[1]) {
                            const chUrl = `https://www.youtube.com/channel/${channelIdMatch[1]}`;
                            try {
                              const r4 = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(chUrl)}`, {
                                signal: (() => {
                                  const ac = new AbortController();
                                  setTimeout(() => ac.abort(), 3000);
                                  return ac.signal;
                                })(),
                              } as any);
                              if (r4.ok) {
                                const d4 = (await r4.json()) as { author_name?: string; title?: string };
                                if (d4?.author_name) p.channel = d4.author_name;
                              }
                            } catch {
                              // ignore
                            }
                          }
                        }
                      }
                    }
                  } catch {
                    // ignore
                  }
                }
              }
            } catch {
              // ignore enrichment errors; keep original values
            }
          }),
        );
      }

      return res.json({
        success: true,
        count: processed.length,
        data: processed,
      });
    } catch (error) {
      console.error('[watch-history] process error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process watch history',
      });
    }
  },
);


