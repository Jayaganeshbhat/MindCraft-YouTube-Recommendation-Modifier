import express, { Router } from 'express';
import LearningPath from '../../models/LearningPath';
import { ensureGoogleSession } from '../../auth/ensureGoogleSession';

export const deletePath = Router();

deletePath.delete('/:id', ensureGoogleSession, async (req, res) => {
  try {
    const userId = req.user?.googleId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const deletedPath = await LearningPath.findOneAndDelete({
      _id: id,
      googleId: userId,
    });

    if (!deletedPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found or not authorized',
      });
    }

    res.json({
      success: true,
      message: 'Learning path deleted successfully',
      data: deletedPath,
    });
  } catch (err) {
    console.error('Delete path error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting learning path',
    });
  }
});
