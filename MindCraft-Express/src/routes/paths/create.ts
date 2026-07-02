import { Router, Request, Response } from 'express';
import LearningPath from '../../models/LearningPath';
import { createPathSchema, mapPaceToMinutes, toTargetDays } from './dto';
import {
  buildOnlineContentPrompt,
  buildMarkdownPrompt,
  buildYouTubeSearchQueryPrompt,
} from './prompt';
import { getAiPlan } from '../../lib/core';
import { ensureGoogleSession } from '../../auth/ensureGoogleSession';
import { fetchYouTubeResourcesForQueries } from '../../lib/youtubeSearch';

export const createPath = Router();

createPath.post('/', ensureGoogleSession, async (req, res) => {
  try {
    const accessToken = req.session.googleTokens?.accessToken;

    if (!accessToken) {
      return res.json({ error: 'No access token in session' });
    }

    const user = req.user!;

    const parsed = createPathSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: 'Invalid payload', details: parsed.error.stack });
    }

    const input = parsed.data;
    const minutesPerDay = mapPaceToMinutes(input.pace);
    const targetDays = toTargetDays(input.finishIn, input.finishUnit);

    const baseDoc = await LearningPath.create({
      userId: user._id,
      googleId: user.googleId,
      email: user.email,
      ...input,
      minutesPerDay,
      targetDays,
    });

    // Build prompt and call AI
    const markdownPrompt = buildMarkdownPrompt({
      ...input,
      minutesPerDay,
      targetDays,
    });
    const onlineContentPrompt = buildOnlineContentPrompt({
      ...input,
      minutesPerDay,
      targetDays,
    });
    const youtubeSearchQueryPrompt = buildYouTubeSearchQueryPrompt({
      ...input,
      minutesPerDay,
      targetDays,
    });

    const t0 = Date.now();

    console.log('fetching markdown...');
    const markdownResp = await getAiPlan({
      prompt: markdownPrompt,
      config: { responseMimeType: 'text/plain' },
    });
    console.log('fetched markdown');

    console.log('fetching online resources...');
    const jsonResp = await getAiPlan({ prompt: onlineContentPrompt });
    console.log('fetched online resources');

    console.log('fetching youtube search queries...');
    const youtubeSearchQueries = await getAiPlan({
      prompt: youtubeSearchQueryPrompt,
    });
    console.log('fetched youtube search queries');
    const t1 = Date.now();

    console.log(`Total Time Taken by AI: ${(t1 - t0) / 1000} seconds`);

    console.log('fetching YouTube resources from queries');
    const youtubeSearchResults = await fetchYouTubeResourcesForQueries(
      youtubeSearchQueries.content,
      accessToken,
    );

    if (!youtubeSearchResults.ok) {
      console.error(
        'Failed to fetch YouTube resources:: ',
        youtubeSearchResults.error,
      );
    }

    console.log('YouTube resources fetched successfully');
    console.log('saving path to database...');

    // Update document with AI output
    baseDoc.planMarkdown = markdownResp.content;
    baseDoc.onlineResources = jsonResp.content;
    baseDoc.youtubeResources = youtubeSearchResults.ok
      ? youtubeSearchResults.data
      : [];
    baseDoc.aiPlanMeta = {
      provider: 'gemini',
      model: jsonResp.model,
      responseId: jsonResp.responseId,
      durationMs: t1 - t0,
      createdAt: new Date(),
    };
    await baseDoc.save();
    console.log('path saved to database successfully');

    // Return to UI
    return res.status(201).json(baseDoc);
  } catch (err: any) {
    console.error('Create path error:', err);
    return res
      .status(500)
      .json({ error: 'Failed to create learning path', message: err?.message });
  }
});
