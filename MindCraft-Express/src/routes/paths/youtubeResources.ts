import { Router, Request, Response } from 'express';
import LearningPath from '../../models/LearningPath';
import { ensureGoogleSession } from '../../auth/ensureGoogleSession';

export const youtubeResources = Router();

youtubeResources.get(
  '/youtube-resources',
  ensureGoogleSession,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.googleId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const paths = await LearningPath.find({ googleId: userId })
        .select(
          [
            '_id',
            'name',
            'pathType',
            'selectedRoleOrSkill',
            'currentLevel',
            'pace',
            'finishIn',
            'finishUnit',
            'targetDays',
            'minutesPerDay',
            'createdAt',
            'youtubeResources',
          ].join(' ')
        )
        .sort({ createdAt: -1 })
        .lean();


      const data =
        // @ts-ignore
        paths?.map((path) => ({
          id: path._id,
          name: path.name,
          pathType: path.pathType,
          selectedRoleOrSkill: path.selectedRoleOrSkill,
          currentLevel: path.currentLevel,
          pace: path.pace,
          finishIn: path.finishIn,
          finishUnit: path.finishUnit,
          targetDays: path.targetDays,
          minutesPerDay: path.minutesPerDay,
          createdAt: path.createdAt,
          youtubeResources: path.youtubeResources,
        })) || [];

      return res.json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      console.error('Error fetching YouTube resources for all paths:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch YouTube video resources',
      });
    }
  }
);
