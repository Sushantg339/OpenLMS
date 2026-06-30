import { api, type ApiEnvelope } from "../api-client";
import type { ContinueLearningItem, MyCourseProgress } from "@/types";

export const dashboardService = {
  myCourses: () =>
    api.get<ApiEnvelope<MyCourseProgress[]>>("/dashboard/my-courses").then((r) => r.data.data),

  continueLearning: () =>
    api.get<ApiEnvelope<ContinueLearningItem[]>>("/dashboard/continue-learning").then((r) => r.data.data),
};