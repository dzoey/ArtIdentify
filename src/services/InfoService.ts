import type {DetectedObject, LocationData, ObjectInfo, InfoSource} from '../types';
import {findNearestVenue} from './MuseumLocations';

/**
 * InfoService — retrieves detailed information about identified objects.
 *
 * Strategy (hybrid on-device + cloud):
 * 1. On-device ML Kit detects objects and labels them
 * 2. For art/objects, we query Wikipedia REST API for structured info
 * 3. If the user is at a known museum, we query the museum's collection API
 * 4. We cross-reference location to provide curation/venue context
 */

// Art-related label keywords that we care about
const ART_KEYWORDS = [
  'painting', 'sculpture', 'statue', 'portrait', 'landscape', 'still life',
  'abstract', 'mosaic', 'fresco', 'drawing', 'print', 'photograph',
  'installation', 'collage', 'tapestry', 'relief', 'bust', 'figurine',
  'vase', 'urn', 'amphora', 'krater', 'sarcohpagus', 'mummy',
  'altar', 'reliquary', 'candlestick', 'chalice', 'retable',
  'altarpiece', 'diptych', 'triptych', 'polyptych', 'icon',
  'furniture', 'chair', 'table', 'cabinet', 'desk',
  'armor', 'helmet', 'shield', 'sword', 'weapon',
  'coin', 'medal', 'seal', 'gem', 'jewelry', 'crown',
  'textile', 'garment', 'costume', 'lace',
  'clock', 'watch', 'instrument', 'globe', 'sundial',
  'book', 'manuscript', 'codex', 'scroll',
  'painting', 'canvas', 'panel', 'oil', 'watercolor',
  'bronze', 'marble', 'terracotta', 'wood', 'ivory',
  'silver', 'gold', 'ceramic', 'porcelain', 'glass',
  'engraving', 'etching', 'lithograph', 'woodcut',
];

/**
 * Check if a detected label is art/culture related
 */
export function isArtRelated(label: string): boolean {
  const lower = label.toLowerCase();
  return ART_KEYWORDS.some(keyword => lower.includes(keyword));
}

/**
 * Query Wikipedia REST API for information about a topic.
 * Returns structured summary text + optional image URL.
 */
async function queryWikipedia(label: string): Promise<Partial<ObjectInfo>> {
  try {
    // Use the Wikipedia REST summary endpoint
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      label.replace(/\s+/g, '_'),
    )}`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
      // Try search first
      return await searchWikipedia(label);
    }

    const data = await response.json();

    if (data.type === 'disambiguation') {
      return await searchWikipedia(label);
    }

    return {
      infoText: data.extract || 'No information available.',
      infoSource: 'wikipedia' as InfoSource,
      externalLinks: [
        {label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${encodeURIComponent(label.replace(/\s+/g, '_'))}`},
      ],
    };
  } catch (error) {
    console.log('Wikipedia query error:', error);
    return {
      infoText: 'Unable to retrieve information at this time.',
      infoSource: 'wikipedia' as InfoSource,
    };
  }
}

/**
 * Search Wikipedia for a label, pick the best result, then get its summary
 */
async function searchWikipedia(label: string): Promise<Partial<ObjectInfo>> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/page?limit=5&q=${encodeURIComponent(label)}`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      return {
        infoText: 'No information found for this object.',
        infoSource: 'wikipedia' as InfoSource,
      };
    }

    const data = await response.json();
    const pages = data.pages || [];
    if (pages.length === 0) {
      return {
        infoText: 'No information found for this object.',
        infoSource: 'wikipedia' as InfoSource,
      };
    }

    // Use the first result
    const bestMatch = pages[0];
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch.key)}`;
    const summaryResponse = await fetch(summaryUrl);
    if (!summaryResponse.ok) {
      return {
        infoText: bestMatch.snippet || 'Limited information available.',
        infoSource: 'wikipedia' as InfoSource,
        externalLinks: [
          {label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${encodeURIComponent(bestMatch.key)}`},
        ],
      };
    }

    const summaryData = await summaryResponse.json();
    return {
      infoText: summaryData.extract || bestMatch.snippet || 'No information available.',
      infoSource: 'wikipedia' as InfoSource,
      externalLinks: [
        {label: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${encodeURIComponent(bestMatch.key)}`},
      ],
    };
  } catch (error) {
    console.log('Wikipedia search error:', error);
    return {
      infoText: 'Unable to search for information at this time.',
      infoSource: 'wikipedia' as InfoSource,
    };
  }
}

/**
 * Query a museum's collection API (if available) for more specific results.
 * Currently supports the Met Museum API. Other museums can be added.
 */
async function queryMuseumAPI(
  label: string,
  venueName: string,
  apiEndpoint?: string,
): Promise<Partial<ObjectInfo> | null> {
  if (!apiEndpoint) {
    return null;
  }

  try {
    // Met Museum API
    if (venueName.includes('Metropolitan')) {
      const searchUrl = `${apiEndpoint}search?q=${encodeURIComponent(label)}&hasImages=true`;
      const response = await fetch(searchUrl);
      if (!response.ok) return null;

      const data = await response.json();
      const objectIDs = data.objectIDs || [];
      if (objectIDs.length === 0) return null;

      // Get the first object's details
      const objectUrl = `${apiEndpoint}objects/${objectIDs[0]}`;
      const objResponse = await fetch(objectUrl);
      if (!objResponse.ok) return null;

      const obj = await objResponse.json();
      return {
        infoText: obj.objectName || obj.title || obj.period || 'Museum object',
        infoSource: 'museum_api' as InfoSource,
        externalLinks: obj.objectURL
          ? [{label: 'Met Museum', url: obj.objectURL}]
          : [],
      };
    }

    // Add other museum APIs here...
    return null;
  } catch (error) {
    console.log('Museum API error:', error);
    return null;
  }
}

/**
 * Build location context text — what museum are we in?
 */
function buildLocationContext(location: LocationData): string | null {
  const venue = findNearestVenue(location);
  if (venue) {
    return `You are currently at or near ${venue.name}. ` +
      `This object may be part of their collection.`;
  }

  // Check if we have reverse geocode data
  if (location.venueName) {
    return `You are at ${location.venueName}.`;
  }

  return null;
}

/**
 * Main entry point: get detailed info for a detected object.
 * Combines on-device label with cloud-based info retrieval.
 */
export async function getObjectInfo(
  detectedObject: DetectedObject,
  location?: LocationData | null,
): Promise<ObjectInfo> {
  const label = detectedObject.label;
  let infoParts: string[] = [];
  let externalLinks: {label: string; url: string}[] = [];
  let source: InfoSource = 'wikipedia';

  // 1. Add location context if available
  if (location) {
    const context = buildLocationContext(location);
    if (context) {
      infoParts.push(context);
    }

    // 2. Try museum API first if we're at a known venue
    const venue = findNearestVenue(location);
    if (venue && venue.apiEndpoint) {
      const museumInfo = await queryMuseumAPI(label, venue.name, venue.apiEndpoint);
      if (museumInfo && museumInfo.infoText) {
        infoParts.push(museumInfo.infoText);
        source = 'museum_api';
        if (museumInfo.externalLinks) {
          externalLinks.push(...museumInfo.externalLinks);
        }
      }
    }
  }

  // 3. Query Wikipedia for encyclopedic info
  const wikiInfo = await queryWikipedia(label);
  if (wikiInfo.infoText) {
    infoParts.push(wikiInfo.infoText);
    if (wikiInfo.externalLinks) {
      externalLinks.push(...wikiInfo.externalLinks);
    }
  }

  // 4. Add confidence info
  infoParts.push(
    `\n\nIdentified as "${label}" with ${Math.round(
      detectedObject.confidence * 100,
    )}% confidence.`,
  );

  return {
    detectedObject: {
      ...detectedObject,
      description: infoParts.join('\n\n'),
    },
    infoText: infoParts.join('\n\n'),
    infoSource: source,
    externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
  };
}