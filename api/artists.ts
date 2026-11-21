import type { IncomingMessage, ServerResponse } from "node:http";
import { searchMusicBrainz } from "../src/lib/musicbrainz";

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[] | undefined>;
}

function searchParamsFromRequest(request: VercelRequest): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.query)) {
    if (typeof value === "string") params.set(key, value);
  }
  return params;
}

export default async function handler(request: VercelRequest, response: ServerResponse) {
  response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.statusCode = 405;
    response.end(JSON.stringify({ error: "Method not allowed." }));
    return;
  }

  try {
    const result = await searchMusicBrainz(searchParamsFromRequest(request));
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.statusCode = 200;
    response.end(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Artist search failed.";
    console.error("MusicBrainz artist search failed:", error);
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.statusCode = message.includes("must be") ? 400 : 502;
    response.end(JSON.stringify({ error: message }));
  }
}
