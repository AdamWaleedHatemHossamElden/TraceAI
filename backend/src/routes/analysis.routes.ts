import { Router } from "express";

import {
  createAnalysis,
  deleteAnalysis,
  getAnalysis,
  listAnalyses,
  updateAnalysis
} from "../controllers/analysis.controller";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const analysisRouter = Router();

analysisRouter.use(authenticate);

analysisRouter.post(
  "/",
  asyncHandler((request, response) => createAnalysis(request as AuthenticatedRequest, response))
);
analysisRouter.get(
  "/",
  asyncHandler((request, response) => listAnalyses(request as AuthenticatedRequest, response))
);
analysisRouter.get(
  "/:analysisId",
  asyncHandler((request, response) => getAnalysis(request as AuthenticatedRequest, response))
);
analysisRouter.patch(
  "/:analysisId",
  asyncHandler((request, response) => updateAnalysis(request as AuthenticatedRequest, response))
);
analysisRouter.delete(
  "/:analysisId",
  asyncHandler((request, response) => deleteAnalysis(request as AuthenticatedRequest, response))
);
