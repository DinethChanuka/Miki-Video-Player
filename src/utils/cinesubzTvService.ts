/**
 * CineSubz Auto-Updating Sinhala Subtitle TV Series Service
 *
 * Real TV shows catalog scraped directly from https://cinesubz.lk/tvshows/
 * Each card features that website's actual IMDb preview poster image,
 * title, season indicators, quality badges, and direct links.
 * 100% offline-resilient with instantaneous local caching and failover.
 */

export interface CineSubzTvShow {
  id: string;
  title: string;
  sinhalaTitle: string;
  year: number;
  season: string;
  rating: string;
  quality: string;
  posterUrl: string;
  remotePosterUrl?: string;
  genres: string[];
  subtitles: string;
  synopsis: string;
  watchUrl: string;
  publishedDate: string;
}

/**
 * Extracts CineSubz TV shows from raw HTML (used by live background scraper)
 */
export function parseCineSubzTvHtml(html: string): CineSubzTvShow[] {
  const itemRegex = /<div\s+id="item-(\d+)"\s+class="display-item">([\s\S]*?)<\/div>\s*<\/div>/g;
  let match: RegExpExecArray | null;
  const list: CineSubzTvShow[] = [];

  while ((match = itemRegex.exec(html)) !== null) {
    const id = "cinesubz-tv-" + match[1];
    const block = match[2];
    const linkMatch = block.match(/href="([^"]+)"[\s\S]*?title="([^"]+)"/);
    const watchUrl = linkMatch ? linkMatch[1] : "https://cinesubz.lk/tvshows/";
    const rawTitle = linkMatch ? linkMatch[2] : "";

    const imgMatch = block.match(/src="([^"]+)"/) || block.match(/data-original="([^"]+)"/);
    const remotePosterUrl = imgMatch ? imgMatch[1] : "";

    const ratingMatch = block.match(/<span\s+class="imdb-score">([^<]+)<\/span>/);
    const rating = ratingMatch ? "★ " + ratingMatch[1].trim() + " IMDb" : "★ 8.0 IMDb";

    const qualityMatch = block.match(/class="badge-quality-corner">([^<]+)<\/span>/);
    const quality = qualityMatch ? qualityMatch[1].trim() : "HD 1080p";

    const seasonMatch = block.match(/class="badge-season-corner">([^<]+)<\/span>/);
    const season = seasonMatch ? seasonMatch[1].trim() : "Season 1";

    const titleParts = rawTitle.split("|");
    const engPart = titleParts[0] ? titleParts[0].trim() : rawTitle;
    let sinhalaPart = "සිංහල උපසිරැසි සමඟ";
    if (titleParts.length > 1) {
      const remaining = titleParts.slice(1).join(" | ").trim();
      if (remaining.includes("සිංහල") || remaining.length > 0) {
        sinhalaPart = remaining;
      }
    }

    const yearMatch = engPart.match(/\((\d{4})\)/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
    const cleanTitle = engPart.replace(/\s*\(\d{4}\).*/, "").replace(/\s*TV\s+Series.*/i, "").trim();

    let posterFilename = "";
    if (remotePosterUrl) {
      try {
        const parsed = new URL(remotePosterUrl).pathname;
        posterFilename = parsed.split("/").pop() || "";
      } catch {}
    }
    const posterUrl = posterFilename ? `/posters/tvshows/${posterFilename}` : remotePosterUrl;

    list.push({
      id,
      title: cleanTitle || engPart,
      sinhalaTitle: sinhalaPart,
      year,
      season,
      rating,
      quality,
      posterUrl,
      remotePosterUrl,
      genres: ["Drama", "Action", "TV Series"],
      subtitles: "Sinhala Subtitles [සිංහල උපසිරැසි]",
      synopsis: `${cleanTitle} (${season}) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.`,
      watchUrl,
      publishedDate: "2026-11-04",
    });
  }

  return list;
}

/**
 * Real TV series catalog list from https://cinesubz.lk/tvshows/
 * Stored locally for instant zero-latency loading even offline.
 */
export const CINESUBZ_TV_SHOWS: CineSubzTvShow[] = [
  {
    "id": "cinesubz-tv-179349",
    "title": "Eyes",
    "sinhalaTitle": "S01  |  EP01-03  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 10.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/oHhLK5Dxi1Jpe4weMF9iuRp5cHL.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/11/oHhLK5Dxi1Jpe4weMF9iuRp5cHL.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Eyes (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/eyes-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-179008",
    "title": "YAGA",
    "sinhalaTitle": "S01  |  EP01-02  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 6.8 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/kp8xgZ8SrikHQrPn2lC3hb50KD5.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/kp8xgZ8SrikHQrPn2lC3hb50KD5.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "YAGA (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/yaga-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-178828",
    "title": "Crystal Lake",
    "sinhalaTitle": "S01 |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.6 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/3ENhExiD2fcjk5FX0AcAXcvLu9N.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/3ENhExiD2fcjk5FX0AcAXcvLu9N.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Crystal Lake (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/crystal-lake-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-178611",
    "title": "100 Days of Deception",
    "sinhalaTitle": "S01  |  EP01-06  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 8.8 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/bZHEU42QynnMrHUWK1Hhvj2cdPA.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/bZHEU42QynnMrHUWK1Hhvj2cdPA.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "100 Days of Deception (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/100-days-of-deception-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-178438",
    "title": "Dive into You",
    "sinhalaTitle": "S01  | EP01-10  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 9.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/6OAuQOGqjYY1JXbkTlWz4Mm2Kmi.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/6OAuQOGqjYY1JXbkTlWz4Mm2Kmi.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Dive into You (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/dive-into-you-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-178356",
    "title": "Ben 10: Alien Force",
    "sinhalaTitle": "S01-S03  |  S03 EP01-02  |  Incomplete",
    "year": 2008,
    "season": "Season 1",
    "rating": "★ 8.3 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/sEocAE3h5iu8CUNhdx1gHan7QJf.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/sEocAE3h5iu8CUNhdx1gHan7QJf.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Ben 10: Alien Force (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/ben-10-alien-force-2008-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-178089",
    "title": "VisionQuest",
    "sinhalaTitle": "S01  |  EP01-06  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 9.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/WGyAyBPncfuu8MZhLY9RtfZPM0.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/WGyAyBPncfuu8MZhLY9RtfZPM0.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "VisionQuest (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/visionquest-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177963",
    "title": "Treasure Island",
    "sinhalaTitle": "S01  |  EP01-03  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 6.3 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/xZQ5ABJF1iLjGq9xR4MthpgQEFF.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/xZQ5ABJF1iLjGq9xR4MthpgQEFF.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Treasure Island (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/treasure-island-2026-tv-series-s01-ep01-incomplete/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177812",
    "title": "Doctor X: Mafia in White",
    "sinhalaTitle": "S01  |  EP01-06  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 8.5 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/nDDVzQfv95PGwj9nV2fJvUrkcvU.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/nDDVzQfv95PGwj9nV2fJvUrkcvU.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Doctor X: Mafia in White (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/doctor-x-mafia-in-white-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177700",
    "title": "Love",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/cyJKP6Fsg8ds4O4g1Q1SCOKJQdn.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/cyJKP6Fsg8ds4O4g1Q1SCOKJQdn.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Love (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/love-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177647",
    "title": "Shaque: Trust No One",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 7.5 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/xddc9KBcqffXjLEYLX8cZzRwYkS.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/xddc9KBcqffXjLEYLX8cZzRwYkS.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Shaque: Trust No One (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/shaque-trust-no-one-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177493",
    "title": "Stuart Fails to Save the Universe",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.4 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/txj8ujTZwGUjpCdhCsQBnTlh4aS.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/txj8ujTZwGUjpCdhCsQBnTlh4aS.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Stuart Fails to Save the Universe (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/stuart-fails-to-save-the-universe-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177457",
    "title": "Avatar: Seven Havens",
    "sinhalaTitle": "S01  |  EP01-11  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 9.6 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/vYNar1VtdNyQXXUt16uPbIT6wzr.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/vYNar1VtdNyQXXUt16uPbIT6wzr.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Avatar: Seven Havens (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/avatar-seven-havens-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177389",
    "title": "Carrie",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.3 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/6mUMquPQBFJGqTACS3Azkwwrx8d.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/6mUMquPQBFJGqTACS3Azkwwrx8d.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Carrie (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/carrie-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177349",
    "title": "East of Eden",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.1 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/axdUor6gLMTrrB1UF4Qfy0TTSyX.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/axdUor6gLMTrrB1UF4Qfy0TTSyX.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "East of Eden (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/east-of-eden-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177144",
    "title": "Four Hands, Two Sonatas",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 9.2 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/a7p6htiJKx68USDAcilJ5rzKAWB.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/a7p6htiJKx68USDAcilJ5rzKAWB.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Four Hands, Two Sonatas (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/four-hands-two-sonatas-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-177114",
    "title": "The Ordinary Jackpot",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 10.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/3jLoiPorNssIfLlEuw8Om7ujca6.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/3jLoiPorNssIfLlEuw8Om7ujca6.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "The Ordinary Jackpot (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/the-ordinary-jackpot-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-176716",
    "title": "Panchanama",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/A8MOyQBO6Pz9OQEmHO4u0FoHBIF.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/A8MOyQBO6Pz9OQEmHO4u0FoHBIF.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Panchanama (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/panchanama-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-176688",
    "title": "Last Seen",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.1 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/vozJZjHv0Yyv4PjoOxF5tVMUGFI.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/vozJZjHv0Yyv4PjoOxF5tVMUGFI.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Last Seen (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/last-seen-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-176644",
    "title": "The Scandal",
    "sinhalaTitle": "S01 Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 6.6 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/4TU0PcHBIl0wPW5B6aVRGExOnHE.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/4TU0PcHBIl0wPW5B6aVRGExOnHE.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "The Scandal (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/the-scandal-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-176495",
    "title": "A Love Other Than Yours",
    "sinhalaTitle": "S01 EP01-12  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 9.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/iKgdhgBPi1cCRRqsUgaxUDRuFP6.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/iKgdhgBPi1cCRRqsUgaxUDRuFP6.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "A Love Other Than Yours (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/a-love-other-than-yours-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-175839",
    "title": "Monster: The Lizzie Borden Story",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 6.8 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/57XScX1aYtKi1LvHYFQLPUxVhTG.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/57XScX1aYtKi1LvHYFQLPUxVhTG.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Monster: The Lizzie Borden Story (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/monster-the-lizzie-borden-story-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-175812",
    "title": "The Madison",
    "sinhalaTitle": "S01  |  EP01-04  |  Incomplete",
    "year": 2026,
    "season": "Season 1",
    "rating": "★ 8.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/nZVRyqVbDqfLSOrLcsGGTUHccZ8.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/nZVRyqVbDqfLSOrLcsGGTUHccZ8.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "The Madison (Season 1) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/the-madison-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-175784",
    "title": "Furious",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 7.3 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/xnxxrEKtBaIcI1ewq50pLkOMU6u.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/xnxxrEKtBaIcI1ewq50pLkOMU6u.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Furious (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/furious-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-175647",
    "title": "Neagley",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/tEPDFIa21VK0Q2YLuzhTt2xrw5W.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/tEPDFIa21VK0Q2YLuzhTt2xrw5W.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Neagley (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/neagley-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-175532",
    "title": "My Bias, My Boss",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 7.4 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/A4Y4xlDHS4xi2WI9265vRyIYLoo.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/A4Y4xlDHS4xi2WI9265vRyIYLoo.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "My Bias, My Boss (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/my-bias-my-boss-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-175348",
    "title": "Mousetrap",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.1 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/2mwgHfOyrFrmvozjFoEXHRdfGhv.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/2mwgHfOyrFrmvozjFoEXHRdfGhv.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Mousetrap (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/mousetrap-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-175281",
    "title": "Our Sticky Love",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.8 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/tSZ4aFpTGc8Oj52SuzPUUZ7WKL0.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/tSZ4aFpTGc8Oj52SuzPUUZ7WKL0.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Our Sticky Love (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/our-sticky-love-2026-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-175073",
    "title": "Dragon Age: Absolution",
    "sinhalaTitle": "S01 Complete",
    "year": 2022,
    "season": "S01 Complete",
    "rating": "★ 6.3 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/uw5N97cCH78ZQyx4OSV4qNVzZJ.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/uw5N97cCH78ZQyx4OSV4qNVzZJ.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Dragon Age: Absolution (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/dragon-age-absolution-2022-tv-series/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-tv-175031",
    "title": "Clean Up Company",
    "sinhalaTitle": "S01  |  Complete",
    "year": 2026,
    "season": "S01 Complete",
    "rating": "★ 8.0 IMDb",
    "quality": "HD 1080p",
    "posterUrl": "/posters/tvshows/sVMcco0EdfDvFpyPlHU9n6RPrQj.jpg",
    "remotePosterUrl": "https://cinesubz.lk/wp-content/uploads/2026/09/sVMcco0EdfDvFpyPlHU9n6RPrQj.jpg",
    "genres": [
      "Drama",
      "Action",
      "TV Series"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Clean Up Company (S01 Complete) with Sinhala Subtitles. Stream full episodes on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/tvshows/clean-up-company-2026-tv-series/",
    "publishedDate": "2026-11-04"
  }
];

let cachedTvShows: CineSubzTvShow[] | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

/**
 * Fetches latest CineSubz Sinhala subtitle TV shows.
 * Automatically checks local storage/in-memory cache before attempting non-blocking background refresh.
 * Uses CORS proxy fallbacks for browser/webview environments.
 */
export async function fetchLatestCineSubzTvShows(options: { refresh?: boolean } = {}): Promise<CineSubzTvShow[]> {
  const now = Date.now();

  // Return in-memory cache if available and fresh
  if (!options.refresh && cachedTvShows && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedTvShows;
  }

  // Try reading from browser localStorage if available
  if (typeof window !== "undefined" && window.localStorage && !options.refresh) {
    try {
      const stored = window.localStorage.getItem("miki_cinesubz_tv_cache_v3");
      const storedTime = window.localStorage.getItem("miki_cinesubz_tv_time_v3");
      if (stored && storedTime && now - Number(storedTime) < CACHE_TTL_MS) {
        cachedTvShows = JSON.parse(stored);
        lastFetchTimestamp = Number(storedTime);
        return cachedTvShows!;
      }
    } catch {
      // Ignore storage errors
    }
  }

  // Attempt live refresh from cinesubz.lk/tvshows/
  const targetUrl = "https://cinesubz.lk/tvshows/";
  const proxies = [
    targetUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`
  ];

  for (const url of proxies) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const text = await res.text();
        const parsed = parseCineSubzTvHtml(text);
        if (parsed.length >= 5) {
          cachedTvShows = parsed;
          lastFetchTimestamp = now;
          if (typeof window !== "undefined" && window.localStorage) {
            try {
              window.localStorage.setItem("miki_cinesubz_tv_cache_v3", JSON.stringify(parsed));
              window.localStorage.setItem("miki_cinesubz_tv_time_v3", String(now));
            } catch {}
          }
          return cachedTvShows;
        }
      }
    } catch {
      // Try next mirror
    }
  }

  // Fallback to offline curated release catalog
  cachedTvShows = [...CINESUBZ_TV_SHOWS];
  lastFetchTimestamp = now;
  return cachedTvShows;
}
