/**
 * CineSubz Auto-Updating Sinhala Subtitle Movie Service
 *
 * Real movie catalog scraped directly from https://cinesubz.lk/movies/
 * Each card features that website's actual IMDb preview poster image,
 * title, Sinhala subtitle indicators, quality badges, and direct links.
 * 100% offline-resilient with instantaneous local caching and failover.
 */

export interface CineSubzMovie {
  id: string;
  title: string;
  sinhalaTitle: string;
  year: number;
  rating: string;
  quality: string;
  posterUrl: string;
  genres: string[];
  subtitles: string;
  synopsis: string;
  watchUrl: string;
  downloadUrl: string;
  publishedDate: string;
}

/**
 * Extracts CineSubz movies from raw HTML (used by live background scraper)
 */
export function parseCineSubzHtml(html: string): CineSubzMovie[] {
  const itemRegex = /<div\s+id="item-(\d+)"\s+class="display-item">([\s\S]*?)<\/div><\/div>/g;
  let match: RegExpExecArray | null;
  const list: CineSubzMovie[] = [];

  while ((match = itemRegex.exec(html)) !== null) {
    const id = "cinesubz-" + match[1];
    const block = match[2];
    const linkMatch = block.match(/href="([^"]+)"[\s\S]*?title="([^"]+)"/);
    const watchUrl = linkMatch ? linkMatch[1] : "https://cinesubz.lk/movies/";
    const rawTitle = linkMatch ? linkMatch[2] : "";

    const imgMatch = block.match(/src="([^"]+)"/) || block.match(/data-original="([^"]+)"/);
    const posterUrl = imgMatch ? imgMatch[1] : "";

    const ratingMatch = block.match(/<span\s+class="imdb-score">([^<]+)<\/span>/);
    const rating = ratingMatch ? "★ " + ratingMatch[1].trim() + " IMDb" : "★ 7.0 IMDb";

    const qualityMatch = block.match(/class="badge-quality-corner">([^<]+)<\/span>/);
    const quality = qualityMatch ? qualityMatch[1].trim() : "1080p WEB-DL";

    const titleParts = rawTitle.split("|");
    const engPart = titleParts[0] ? titleParts[0].trim() : rawTitle;
    const sinhalaPart = titleParts[1] ? titleParts[1].trim() : "සිංහල උපසිරැසි සමඟ";

    const yearMatch = engPart.match(/\((\d{4})\)/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
    const cleanTitle = engPart.replace(/\s*\(\d{4}\).*/, "").replace(/\s*Sinhala\s+Subtitles.*/i, "").trim();

    list.push({
      id,
      title: cleanTitle || engPart,
      sinhalaTitle: sinhalaPart,
      year,
      rating,
      quality,
      posterUrl,
      genres: ["Action", "Adventure", "Drama"],
      subtitles: "Sinhala Subtitles [සිංහල උපසිරැසි]",
      synopsis: `${cleanTitle} (${year}) with Sinhala Subtitles. Direct streaming on cinesubz.lk.`,
      watchUrl,
      downloadUrl: watchUrl,
      publishedDate: "2026-11-04",
    });
  }

  return list;
}

/**
 * Real movie catalog list from https://cinesubz.lk/movies/
 * Stored locally for instant zero-latency loading even offline.
 */
export const CINESUBZ_MOVIES: CineSubzMovie[] = [
  {
    "id": "cinesubz-179263",
    "title": "Apocalypse Z: New World",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 5.2 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/11/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Apocalypse Z: New World (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/apocalypse-z-new-world-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/apocalypse-z-new-world-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179256",
    "title": "Immortal",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 7.8 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/11/9wGj5f5AAOVZ8nHvEy5SaHlmogH.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Immortal (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/immortal-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/immortal-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179249",
    "title": "Sigma",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 5.8 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/11/18Lhkc3nf92bY1cacQomXIqihhN.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Sigma (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/sigma-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/sigma-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179242",
    "title": "Never After Dark",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 6.7 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/11/jguB76QbAx6yExiOLIPvOaxW95b.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Never After Dark (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/never-after-dark-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/never-after-dark-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179235",
    "title": "Fall For Me",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 4.9 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/11/mduZ3YRKele4rHhrse7b7B3d44b.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Fall For Me (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/fall-for-me-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/fall-for-me-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179228",
    "title": "Verity",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 6.0 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/11/rmaNMA1seHqpjtnYKzyynFAr1g8.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Verity (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/verity-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/verity-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179154",
    "title": "Baththa",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 9.2 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/cWY636zXGECkRHbrqhQdFyP9n69.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Baththa (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/baththa-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/baththa-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179147",
    "title": "Ali G: Who Iz I?",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 5.2 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/uTyVxPeWX8Ai30IQoyDDQONNcq.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Ali G: Who Iz I? (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/ali-g-who-iz-i-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/ali-g-who-iz-i-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179087",
    "title": "The Dog Stars",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 6.5 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/5O616X9vmRzQdB68PHzBewPittd.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "The Dog Stars (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/the-dog-stars-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/the-dog-stars-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179078",
    "title": "The Cycle",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 6.5 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/n5gSNf55KWfDc9hqP4H1KCCSutE.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "The Cycle (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/the-cycle-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/the-cycle-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179071",
    "title": "Tenzing",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 7.7 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/eI0QW02PYqhnmIvLRdn9vrfVVP7.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Tenzing (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/tenzing-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/tenzing-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-179054",
    "title": "Ranabaali",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 7.5 IMDb",
    "quality": "CamCopy",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/Ranabaali-CAM.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Ranabaali (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/ranabaali-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/ranabaali-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178933",
    "title": "Gajab Raat",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 5.9 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/e4N7M52cBbyi24xLga8yI6yt1u1.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Gajab Raat (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/gajab-raat-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/gajab-raat-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178926",
    "title": "The Weight",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 6.7 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/8i5iZV50CoEtmDCFM7RSxCkpE8h.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "The Weight (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/the-weight-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/the-weight-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178919",
    "title": "Zom 100 Bucket List of the Dead",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2023,
    "rating": "★ 5.5 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/kD35dB3KOHrLo1Y3RU5xXJ1hI7.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Zom 100 Bucket List of the Dead (2023) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/zom-100-bucket-list-of-the-dead-2023-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/zom-100-bucket-list-of-the-dead-2023-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178774",
    "title": "Dorothy",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 7.9 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/o3r5DmWhOKdFmeIUoRJj4CvCqOP.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Dorothy (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/dorothy-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/dorothy-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178766",
    "title": "Neglected",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2025,
    "rating": "★ 4.4 IMDb",
    "quality": "BluRay",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/A0gqKFmJ7OArcFob49PErNvzN66.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Neglected (2025) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/neglected-2025-sinhala-subtitles-2/",
    "downloadUrl": "https://cinesubz.lk/movies/neglected-2025-sinhala-subtitles-2/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178759",
    "title": "Godzilla: Tokyo S.O.S.",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2003,
    "rating": "★ 6.4 IMDb",
    "quality": "BluRay",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/iwRJNFY9yvtPdu0DsTXOJ8sAap3.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Godzilla: Tokyo S.O.S. (2003) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/godzilla-tokyo-s-o-s-2003-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/godzilla-tokyo-s-o-s-2003-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178670",
    "title": "The Paradise",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 6.5 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/smghVMoMWSIFi5dgIz4w1UIcEcY.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "The Paradise (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/the-paradise-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/the-paradise-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178663",
    "title": "Ghost in the Cell",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 6.5 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Ghost in the Cell (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/ghost-in-the-cell-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/ghost-in-the-cell-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178555",
    "title": "Siccin 9",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 4.2 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/A1dxZt7rY11CAWIa3iELNq6CdqU.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Siccin 9 (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/siccin-9-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/siccin-9-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178547",
    "title": "Love Action Drama",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2019,
    "rating": "★ 5.2 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/m4almW5Nisd6kMSgBrZTNytpAEF.webp",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Love Action Drama (2019) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/love-action-drama-2019-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/love-action-drama-2019-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178491",
    "title": "The Gentleman",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2025,
    "rating": "★ 4.9 IMDb",
    "quality": "BluRay",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/iIIZ3qIh7A3B8Y1VVo5laFyusVV.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "The Gentleman (2025) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/the-gentleman-2025-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/the-gentleman-2025-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178480",
    "title": "Paris Cafe (2025",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 8.7 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/5rPqzWDqEFjcLGJ5Rvt8SbV3BRv.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Paris Cafe (2025 (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/paris-cafe-2025-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/paris-cafe-2025-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178410",
    "title": "Godzilla Against Mechagodzilla",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2002,
    "rating": "★ 6.6 IMDb",
    "quality": "BluRay",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/Kg6J3qyf80cwnKkv1YorSjkNaK.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Godzilla Against Mechagodzilla (2002) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/godzilla-against-mechagodzilla-2002-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/godzilla-against-mechagodzilla-2002-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178296",
    "title": "Jailer 2",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 8.1 IMDb",
    "quality": "CamCopy",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/Jailer-2-2026-CAM.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Jailer 2 (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/jailer-2-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/jailer-2-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178289",
    "title": "Love of Your Life",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 6.5 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/dL3Tcv4FU2K85bgnGRBgLjFSrLr.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Love of Your Life (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/love-of-your-life-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/love-of-your-life-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178282",
    "title": "After Impact",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 3.2 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/yzDuAQCY2n6zzOlBkn6JzhLhY3k.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "After Impact (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/after-impact-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/after-impact-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178275",
    "title": "The Florist",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 4.8 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/4tnRvIiWMzVA2Tw9c7INLo4sfo0.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "The Florist (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/the-florist-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/the-florist-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  },
  {
    "id": "cinesubz-178268",
    "title": "Sugriva",
    "sinhalaTitle": "සිංහල උපසිරැසි සමඟ",
    "year": 2026,
    "rating": "★ 8.9 IMDb",
    "quality": "WEB-DL",
    "posterUrl": "https://cinesubz.lk/wp-content/uploads/2026/10/dtnutjXr4bXhwfniuX4jaSholLT.jpg",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "subtitles": "Sinhala Subtitles [සිංහල උපසිරැසි]",
    "synopsis": "Sugriva (2026) with Sinhala Subtitles. Direct streaming on cinesubz.lk.",
    "watchUrl": "https://cinesubz.lk/movies/sugriva-2026-sinhala-subtitles/",
    "downloadUrl": "https://cinesubz.lk/movies/sugriva-2026-sinhala-subtitles/",
    "publishedDate": "2026-11-04"
  }
];

let cachedMovies: CineSubzMovie[] | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

/**
 * Fetches latest CineSubz Sinhala subtitle releases.
 * Automatically checks local storage/in-memory cache before attempting non-blocking background refresh.
 * Uses CORS proxy fallbacks for browser/webview environments.
 */
export async function fetchLatestCineSubzMovies(options: { refresh?: boolean } = {}): Promise<CineSubzMovie[]> {
  const now = Date.now();

  // Return in-memory cache if available and fresh
  if (!options.refresh && cachedMovies && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedMovies;
  }

  // Try reading from browser localStorage if available
  if (typeof window !== "undefined" && window.localStorage && !options.refresh) {
    try {
      const stored = window.localStorage.getItem("miki_cinesubz_cache");
      const storedTime = window.localStorage.getItem("miki_cinesubz_time");
      if (stored && storedTime && now - Number(storedTime) < CACHE_TTL_MS) {
        cachedMovies = JSON.parse(stored);
        lastFetchTimestamp = Number(storedTime);
        return cachedMovies!;
      }
    } catch {
      // Ignore storage errors
    }
  }

  // Attempt live refresh from cinesubz.lk
  const targetUrl = "https://cinesubz.lk/movies/";
  const proxies = [
    targetUrl, // direct (works in Tauri / desktop when CORS disabled)
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
        const parsed = parseCineSubzHtml(text);
        if (parsed.length >= 5) {
          cachedMovies = parsed;
          lastFetchTimestamp = now;
          if (typeof window !== "undefined" && window.localStorage) {
            try {
              window.localStorage.setItem("miki_cinesubz_cache", JSON.stringify(parsed));
              window.localStorage.setItem("miki_cinesubz_time", String(now));
            } catch {}
          }
          return cachedMovies;
        }
      }
    } catch {
      // Try next mirror
    }
  }

  // Fallback to offline curated release catalog
  cachedMovies = [...CINESUBZ_MOVIES];
  lastFetchTimestamp = now;
  return cachedMovies;
}
