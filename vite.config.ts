import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { searchMusicBrainz } from "./src/lib/musicbrainz";

function localArtistSearch(): Plugin {
  return {
    name: "local-artist-search",
    configureServer(server) {
      server.middlewares.use("/api/artists", async (request, response) => {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        if (request.method !== "GET") {
          response.statusCode = 405;
          response.end(JSON.stringify({ error: "Method not allowed." }));
          return;
        }

        try {
          const url = new URL(request.url ?? "/", "http://localhost");
          const result = await searchMusicBrainz(url.searchParams);
          response.statusCode = 200;
          response.end(JSON.stringify(result));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Artist search failed.";
          console.error("MusicBrainz artist search failed:", error);
          response.statusCode = message.includes("must be") ? 400 : 502;
          response.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localArtistSearch()],
});
