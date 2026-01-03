import { ExpoRequest, ExpoResponse } from "expo-router/server";

export async function GET(_req: ExpoRequest) {
  return ExpoResponse.json({ status: "ok" });
}

