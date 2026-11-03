import type { GameItem } from './gamesCatalog';

export interface CatalogValidationReport {
  isValid: boolean;
  totalGames: number;
  inbuiltGamesCount: number;
  externalGamesCount: number;
  errors: string[];
  warnings: string[];
}

export function validateGamesCatalog(catalog: Partial<GameItem>[]): CatalogValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  let inbuiltCount = 0;
  let externalCount = 0;

  if (!Array.isArray(catalog)) {
    return {
      isValid: false,
      totalGames: 0,
      inbuiltGamesCount: 0,
      externalGamesCount: 0,
      errors: ['Catalog is not an array'],
      warnings: [],
    };
  }

  for (let i = 0; i < catalog.length; i++) {
    const game = catalog[i];
    const prefix = `Game[${i}]`;

    if (!game.id || typeof game.id !== 'string') {
      errors.push(`${prefix}: Missing or invalid 'id' string`);
    } else {
      if (seenIds.has(game.id)) {
        errors.push(`${prefix}: Duplicate game ID '${game.id}'`);
      }
      seenIds.add(game.id);
    }

    if (!game.title || typeof game.title !== 'string') {
      errors.push(`${prefix}: Missing or invalid 'title' string`);
    }

    if (!game.category || typeof game.category !== 'string') {
      errors.push(`${prefix}: Missing or invalid 'category'`);
    }

    if (!game.thumbnail || typeof game.thumbnail !== 'string') {
      warnings.push(`${prefix} (${game.id}): Missing 'thumbnail' URL`);
    }

    if (game.isInbuilt) {
      inbuiltCount++;
      if (!game.srcDoc || typeof game.srcDoc !== 'string' || game.srcDoc.trim().length === 0) {
        errors.push(`${prefix} (${game.id}): Game is marked isInbuilt: true but missing non-empty srcDoc`);
      }
    } else {
      externalCount++;
      if (!game.url || (!game.url.startsWith('http://') && !game.url.startsWith('https://'))) {
        warnings.push(`${prefix} (${game.id}): External game missing valid HTTP/HTTPS URL`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    totalGames: catalog.length,
    inbuiltGamesCount: inbuiltCount,
    externalGamesCount: externalCount,
    errors,
    warnings,
  };
}
