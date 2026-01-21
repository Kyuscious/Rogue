import { Router, Request, Response } from "express";
import { LeaderboardService } from "../services/leaderboardService.js";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";

const router = Router();

// Submit a score to leaderboard
router.post("/submit", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const {
      characterId,
      finalFloor,
      finalGold,
      totalEncounters,
      runDurationSeconds,
    } = (req.body as Record<string, unknown>) || {};

    if (finalFloor === undefined || finalGold === undefined) {
      return res.status(400).json({ error: "finalFloor and finalGold are required" });
    }

    const entry = await LeaderboardService.submitScore(
      req.user.id,
      req.user.username,
      characterId as string,
      finalFloor as number,
      finalGold as number,
      (totalEncounters as number) || 0,
      runDurationSeconds as number | undefined
    );

    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Submit failed" });
  }
});

// Get global leaderboard
router.get("/global", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const scores = await LeaderboardService.getGlobalLeaderboard(limit);
    res.json(scores);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Fetch failed" });
  }
});

// Get character leaderboard
router.get("/character/:characterId", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const scores = await LeaderboardService.getCharacterLeaderboard(
      req.params.characterId,
      limit
    );
    res.json(scores);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Fetch failed" });
  }
});

// Get user's personal best scores
router.get("/user/best", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const scores = await LeaderboardService.getUserBestScores(req.user.id);
    res.json(scores);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Fetch failed" });
  }
});

// Get user's personal best for a character
router.get(
  "/user/best/:characterId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const score = await LeaderboardService.getUserCharacterBest(
        req.user.id,
        req.params?.characterId || ""
      );
      res.json(score);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Fetch failed" });
    }
  }
);

// Get recent scores
router.get("/recent", async (req: Request, res: Response) => {
  try {
    const hoursBack = Number(req.query.hoursBack) || 24;
    const limit = Math.min(Number(req.query.limit) || 50, 500);
    const scores = await LeaderboardService.getRecentScores(hoursBack, limit);
    res.json(scores);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Fetch failed" });
  }
});

// Get global stats
router.get("/stats/global", async (req: Request, res: Response) => {
  try {
    const stats = await LeaderboardService.getGlobalStats();
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Fetch failed" });
  }
});

export default router;
