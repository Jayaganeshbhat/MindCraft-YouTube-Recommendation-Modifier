import { Request, Response, Router } from 'express';
import LearningPath from '../../models/LearningPath';
import { ensureGoogleSession } from '../../auth/ensureGoogleSession';

export const paths = Router();

paths.get('/', ensureGoogleSession, async (req, res) => {
  try {
    const userId = req.user?.googleId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const paths = await LearningPath.find({ googleId: userId })
      .select(
        'name pathType selectedRoleOrSkill currentLevel pace finishIn finishUnit targetDays minutesPerDay createdAt updatedAt',
      )
      .sort({ createdAt: -1 });

    const data = paths.map((p) => ({
      id: p._id,
      name: p.name,
      type: p.pathType,
      roleOrSkill: p.selectedRoleOrSkill,
      level: p.currentLevel,
      pace: p.pace,
      finishIn: p.finishIn,
      finishUnit: p.finishUnit,
      targetDays: p.targetDays,
      minutesPerDay: p.minutesPerDay,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Error fetching user learning paths:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

paths.get('/:id', ensureGoogleSession, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!; // ensured by ensureAuthed

    // Look up the doc and verify ownership
    const path = await LearningPath.findOne({
      _id: id,
      googleId: user.googleId,
    }).lean();

    if (!path) {
      return res
        .status(404)
        .json({ ok: false, error: 'Learning path not found' });
    }

    res.json({ ok: true, data: path });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});
