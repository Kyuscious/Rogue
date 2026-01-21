import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";
import { GameSaveService } from "../services/gameSaveService.js";

const router = Router();

// Save game state
router.post("/save", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const {
      gameState,
      characterId,
      floorNumber,
      currentGold,
      maxFloorReached,
      runId,
    } = (req.body as Record<string, unknown>) || {};

    const save = await GameSaveService.saveGame(
      req.user.id,
      gameState as Record<string, unknown>,
      characterId as string,
      floorNumber as number,
      currentGold as number,
      maxFloorReached as number,
      runId as string | undefined
    );

    res.json(save);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Save failed" });
  }
});

// Load active game
router.get("/load", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const save = await GameSaveService.loadActiveGame(req.user.id);
    res.json(save);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Load failed" });
  }
});

// Load specific run by ID
router.get("/load/:runId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const save = await GameSaveService.loadSaveByRunId(
      req.user.id,
      req.params?.runId || ""
    );
    res.json(save);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Load failed" });
  }
});

// Get all saves for user
router.get("/list", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const saves = await GameSaveService.getUserSaves(req.user.id);
    res.json(saves);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "List failed" });
  }
});

// Finish a run
router.post("/finish/:runId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const save = await GameSaveService.finishRun(req.user.id, req.params?.runId || "");
    res.json(save);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Finish failed" });
  }
});

// Delete a save
router.delete("/:runId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    await GameSaveService.deleteSave(req.user.id, req.params?.runId || "");
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Delete failed" });
  }
});

export default router;
