import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('My Files (Local Media, Videos, Movies, Music & Images) Audit', () => {
  const homeDashboardFile = path.resolve('src/components/home/HomeDashboardView.tsx');
  const appFile = path.resolve('src/App.tsx');

  it('verifies HomeDashboardView defines My Files as the second main section', () => {
    assert.ok(fs.existsSync(homeDashboardFile), 'HomeDashboardView.tsx must exist');
    const content = fs.readFileSync(homeDashboardFile, 'utf8');

    // 1. HomeNavTab and HomeViewCategory must include my_files / My Files
    assert.match(content, /'my_files'/, 'HomeNavTab must include my_files');
    assert.match(content, /'My Files'/, 'HomeViewCategory must include My Files');

    // 2. Sidebar contains My Files right after Browse All
    const browseAllIdx = content.indexOf('<span>Browse All</span>');
    const myFilesIdx = content.indexOf('<span>My Files</span>');
    const moviesCinemaIdx = content.indexOf('<span>Movies & Cinema</span>');

    assert.ok(browseAllIdx !== -1, 'Browse All must be present in sidebar');
    assert.ok(myFilesIdx !== -1, 'My Files must be present in sidebar');
    assert.ok(moviesCinemaIdx !== -1, 'Movies & Cinema must be present in sidebar');

    assert.ok(
      myFilesIdx > browseAllIdx && myFilesIdx < moviesCinemaIdx,
      'My Files must be placed second in sidebar navigation, immediately after Browse All'
    );

    // 3. Floating Dock contains My Files right after Compass
    const compassIdx = content.indexOf('title="Home (All Sections)"');
    const dockMyFilesIdx = content.indexOf('title="My Files (Videos, Movies, Music, Images)"');
    const dockMoviesIdx = content.indexOf('title="Movies & Cinema"');
    assert.ok(compassIdx !== -1, 'Dock must include Home / Browse All button');
    assert.ok(dockMyFilesIdx !== -1, 'Dock must include My Files button');
    assert.ok(
      dockMyFilesIdx > compassIdx && dockMyFilesIdx < dockMoviesIdx,
      'Dock My Files button must be placed between Home and Movies'
    );

    // 4. Top Category Pills contains My Files
    assert.match(
      content,
      /\['All',\s*'My Files'/,
      'Top category pills must include My Files right after All'
    );
  });

  it('verifies My Files section supports videos, movies, music, and images from recently played local files', () => {
    const content = fs.readFileSync(homeDashboardFile, 'utf8');

    // Section header and categories
    assert.match(
      content,
      /My Files & Local Media|My Local Files/i,
      'HomeDashboardView must contain a dedicated My Files section header'
    );
    assert.match(
      content,
      /Videos & Movies|Videos|Movies/i,
      'My Files must categorize and display local video/movie files'
    );
    assert.match(
      content,
      /Music & Audio|Music|Audio/i,
      'My Files must categorize and display local music/audio files'
    );
    assert.match(
      content,
      /Images & Snapshots|Images|Photos|Snapshots/i,
      'My Files must categorize and display local images or snapshots'
    );

    // Direct open file button & dropzone
    assert.match(
      content,
      /Open Local File/i,
      'My Files must provide Open Local File action button'
    );
    assert.match(
      content,
      /Drag & Drop or Click to Open Local Media/i,
      'My Files must provide local media dropzone banner'
    );

    // Browse All shelf
    assert.match(
      content,
      /My Recent Local Files/i,
      'Browse All overview must include My Recent Local Files shelf'
    );

    // Image lightbox preview
    assert.match(
      content,
      /previewImage/i,
      'My Files must support fullscreen image preview lightbox'
    );
  });

  it('verifies App.tsx recognizes My Files as the current section name', () => {
    assert.ok(fs.existsSync(appFile), 'App.tsx must exist');
    const content = fs.readFileSync(appFile, 'utf8');

    assert.match(
      content,
      /My Files/i,
      'App.tsx must support My Files section name in currentSectionName'
    );
  });
});
