import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Task: Artist "See All" Explorer & Live Internet Song Loading Audit', () => {
  const rootDir = process.cwd();
  const homeViewFile = path.resolve(rootDir, 'src/components/home/HomeDashboardView.tsx');
  const allArtistsModalFile = path.resolve(rootDir, 'src/components/music/AllArtistsModal.tsx');
  const artistCatalogServiceFile = path.resolve(rootDir, 'src/utils/artistCatalogService.ts');

  test('AllArtistsModal component exists and provides rich multilingual explorer interface', () => {
    assert.ok(fs.existsSync(allArtistsModalFile), 'AllArtistsModal.tsx must exist');
    const modalCode = fs.readFileSync(allArtistsModalFile, 'utf-8');

    // Title and language badges
    assert.match(modalCode, /All Artists Directory/i);
    assert.match(modalCode, /English • Hindi • Sinhala/i);

    // Multilingual search input placeholder
    assert.match(modalCode, /Search artists in English, Hindi, Sinhala/i);

    // Language filter selector pills
    assert.match(modalCode, /All Artists/i);
    assert.match(modalCode, /English Hits/i);
    assert.match(modalCode, /Hindi • बॉलीवुड/i);
    assert.match(modalCode, /Sinhala • ශ්‍රී ලංකා/i);

    // Arbitrary artist internet search fallback
    assert.match(modalCode, /Search ["']\{searchQuery\}["'] Live on the Internet/i);
    assert.match(modalCode, /Stream ["']\{searchQuery\}["'] Live from Internet/i);
  });

  test('HomeDashboardView connects "See all" button to AllArtistsModal', () => {
    const homeCode = fs.readFileSync(homeViewFile, 'utf-8');

    // Import check
    assert.match(homeCode, /import \{ AllArtistsModal \} from '\.\.\/music\/AllArtistsModal'/);
    assert.match(homeCode, /import \{[^}]*fetchArtistSongsLive[^}]*\} from '\.\.\/\.\.\/utils\/artistCatalogService'/);

    // Modal state check
    assert.match(homeCode, /const \[isAllArtistsModalOpen, setIsAllArtistsModalOpen\] = useState<boolean>\(false\)/);

    // "See all" click handler check
    assert.match(homeCode, /See all[\s\S]*?setIsAllArtistsModalOpen\(true\)|setIsAllArtistsModalOpen\(true\)[\s\S]*?See all/);

    // Modal mounting check
    assert.match(homeCode, /<AllArtistsModal[\s\S]*?isOpen=\{isAllArtistsModalOpen\}/);
  });

  test('HomeDashboardView implements handleSelectArtist for live internet streaming of artist songs', () => {
    const homeCode = fs.readFileSync(homeViewFile, 'utf-8');

    // handleSelectArtist definition
    assert.match(homeCode, /const handleSelectArtist = useCallback\(/);
    assert.match(homeCode, /fetchArtistSongsLive\(artist\)/);
    assert.match(homeCode, /setLiveSearchedTracks\(liveTracks\)/);
    assert.match(homeCode, /openMedia\(/);

    // Top Artists ribbon click handler wiring
    assert.match(homeCode, /handleSelectArtist\(artist\.name\)/);
  });

  test('HomeDashboardView renders live loading state and Artist Spotlight banner in Sound Lounge results', () => {
    const homeCode = fs.readFileSync(homeViewFile, 'utf-8');

    // Loading banner
    assert.match(homeCode, /Loading all live songs from internet for \{loadingArtistName\}/);
    assert.match(homeCode, /Streaming live YouTube Music tracks with lossless audio/);

    // Artist Spotlight banner
    assert.match(homeCode, /selectedArtistProfile &&/);
    assert.match(homeCode, /selectedArtistProfile\.name/);
    assert.match(homeCode, /Play All/i);
  });

  test('artistCatalogService provides robust coverage for English, Hindi, and Sinhala artists', () => {
    const serviceCode = fs.readFileSync(artistCatalogServiceFile, 'utf-8');

    // Language definitions
    assert.match(serviceCode, /language:\s*'english'/);
    assert.match(serviceCode, /language:\s*'hindi'/);
    assert.match(serviceCode, /language:\s*'sinhala'/);

    // Prominent English artists
    assert.match(serviceCode, /Travis Scott/i);
    assert.match(serviceCode, /Billie Eilish/i);
    assert.match(serviceCode, /Camila Cabello/i);

    // Prominent Hindi artists with Devanagari script
    assert.match(serviceCode, /Arijit Singh/i);
    assert.match(serviceCode, /अरिजीत सिंह/);
    assert.match(serviceCode, /Shreya Ghoshal/i);
    assert.match(serviceCode, /श्रेया घोषाल/);

    // Prominent Sinhala artists with Sinhala Unicode script
    assert.match(serviceCode, /Kasun Kalhara/i);
    assert.match(serviceCode, /කසුන් කල්හාර/);
    assert.match(serviceCode, /H\. R\. Jothipala/i);
    assert.match(serviceCode, /එච්\. ආර්\. ජෝතිපාල/);
    assert.match(serviceCode, /W\. D\. Amaradeva/i);
    assert.match(serviceCode, /ඩබ්\. ඩී\. අමරදේව/);
    assert.match(serviceCode, /Bathiya and Santhush/i);
    assert.match(serviceCode, /භාතිය සහ සන්තුෂ්/);
  });
});
