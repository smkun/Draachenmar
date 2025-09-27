import { Character, Location, Item, Adventure, Organization, ContentCategory } from '../types';

export interface EnhancedCrossReference {
  id: string;
  name: string;
  category: ContentCategory;
  relationship: string;
  description?: string;
  confidence: number; // 0-1 score indicating how confident we are about this relationship
  relationshipType: 'explicit' | 'mentioned' | 'inferred' | 'family' | 'political' | 'geographic' | 'created_by';
}

interface RelationshipPattern {
  pattern: RegExp;
  relationshipType: string;
  confidence: number;
}

// Enhanced relationship detection patterns
const RELATIONSHIP_PATTERNS: RelationshipPattern[] = [
  // Family relationships
  { pattern: /\b(son|daughter|father|mother|brother|sister|wife|husband|spouse)\s+of\s+([^.!?]+)/gi, relationshipType: 'family', confidence: 0.9 },
  { pattern: /\b([^.!?]+)\s+is\s+(his|her|their)\s+(son|daughter|father|mother|brother|sister|wife|husband|spouse)/gi, relationshipType: 'family', confidence: 0.9 },

  // Political relationships
  { pattern: /\b(rules?|governs?|commands?|leads?|serves?)\s+([^.!?]+)/gi, relationshipType: 'political', confidence: 0.8 },
  { pattern: /\b(king|queen|ruler|leader|captain|commander|advisor|minister)\s+of\s+([^.!?]+)/gi, relationshipType: 'political', confidence: 0.8 },

  // Geographic relationships
  { pattern: /\b(from|of|in|at|near|within)\s+([^.!?]+)/gi, relationshipType: 'geographic', confidence: 0.7 },
  { pattern: /\blocated\s+(in|at|near|within)\s+([^.!?]+)/gi, relationshipType: 'geographic', confidence: 0.8 },

  // Creation relationships
  { pattern: /\b(created|made|forged|crafted|built)\s+by\s+([^.!?]+)/gi, relationshipType: 'created_by', confidence: 0.9 },
  { pattern: /\b([^.!?]+)\s+(created|made|forged|crafted|built)\s+(this|it|the)/gi, relationshipType: 'created_by', confidence: 0.8 },
];

// Named entity patterns for better detection
const ENTITY_PATTERNS = {
  character: /\b(King|Queen|Prince|Princess|Duke|Duchess|Lord|Lady|Captain|Master|Elder|High|Arch)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
  location: /\b(Kingdom|City|Town|Village|Fortress|Castle|Temple|Guild|Academy)\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
  organization: /\b(Guild|Order|Academy|Temple|Court|Council)\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
};

export function buildEnhancedCrossReferences(
  content: any,
  category: ContentCategory,
  allData: {
    characters: Character[];
    locations: Location[];
    items: Item[];
    adventures: Adventure[];
    organizations: Organization[];
  }
): EnhancedCrossReference[] {
  const references: EnhancedCrossReference[] = [];
  const seenRefs = new Set<string>();

  // Combine all searchable text
  const searchText = [
    content.description || '',
    content.background || '',
    content.history || '',
    content.personality || '',
    content.appearance || '',
    JSON.stringify(content.notableFigures || []),
    JSON.stringify(content.establishments || []),
    JSON.stringify(content.relationships || [])
  ].join(' ');

  // 1. Explicit relationships from data structure
  if (content.relationships) {
    for (const relationship of content.relationships) {
      const targetEntry = findEntryByName(relationship.name || relationship.target, allData);
      if (targetEntry && targetEntry.id !== content.id) {
        const refKey = `${targetEntry.category}-${targetEntry.id}`;
        if (!seenRefs.has(refKey)) {
          references.push({
            id: targetEntry.id,
            name: targetEntry.name,
            category: targetEntry.category,
            relationship: relationship.type || relationship.relationship || 'related',
            description: relationship.description,
            confidence: 1.0,
            relationshipType: 'explicit'
          });
          seenRefs.add(refKey);
        }
      }
    }
  }

  // 2. Enhanced pattern-based detection
  for (const pattern of RELATIONSHIP_PATTERNS) {
    let match;
    while ((match = pattern.pattern.exec(searchText)) !== null) {
      const extractedName = match[2] || match[1];
      if (extractedName) {
        const targetEntry = findEntryByName(extractedName.trim(), allData);
        if (targetEntry && targetEntry.id !== content.id) {
          const refKey = `${targetEntry.category}-${targetEntry.id}`;
          if (!seenRefs.has(refKey)) {
            references.push({
              id: targetEntry.id,
              name: targetEntry.name,
              category: targetEntry.category,
              relationship: generateRelationshipDescription(pattern.relationshipType, match[0]),
              confidence: pattern.confidence,
              relationshipType: pattern.relationshipType as any
            });
            seenRefs.add(refKey);
          }
        }
      }
    }
  }

  // 3. Direct name matching with context
  const allEntries = [
    ...allData.characters.map(c => ({ ...c, category: 'people' as ContentCategory })),
    ...allData.locations.map(l => ({ ...l, category: 'places' as ContentCategory })),
    ...allData.items.map(i => ({ ...i, category: 'items' as ContentCategory })),
    ...allData.adventures.map(a => ({ ...a, category: 'adventures' as ContentCategory })),
    ...allData.organizations.map(o => ({ ...o, category: 'organizations' as ContentCategory }))
  ];

  for (const entry of allEntries) {
    if (entry.id === content.id || entry.category === category) continue;

    const nameVariations = [
      entry.name,
      entry.name.replace(/["""]/g, ''), // Remove quotes
      entry.name.split(' ').slice(-1)[0], // Last name only
      ...(entry.title ? [entry.title] : [])
    ];

    for (const nameVar of nameVariations) {
      if (nameVar.length > 3 && searchText.toLowerCase().includes(nameVar.toLowerCase())) {
        const refKey = `${entry.category}-${entry.id}`;
        if (!seenRefs.has(refKey)) {
          const context = extractContext(searchText, nameVar);
          const relationshipType = inferRelationshipType(context, entry.category);

          references.push({
            id: entry.id,
            name: entry.name,
            category: entry.category,
            relationship: generateContextualRelationship(context, entry.category),
            confidence: calculateConfidence(nameVar, searchText, context),
            relationshipType: relationshipType
          });
          seenRefs.add(refKey);
        }
        break;
      }
    }
  }

  // 4. Location-specific relationships
  if (category === 'places') {
    // Add characters from notableFigures
    if (content.notableFigures) {
      for (const figure of content.notableFigures) {
        const character = allData.characters.find(c =>
          normalizeForComparison(c.name) === normalizeForComparison(figure.name)
        );
        if (character) {
          const refKey = `people-${character.id}`;
          if (!seenRefs.has(refKey)) {
            references.push({
              id: character.id,
              name: character.name,
              category: 'people',
              relationship: figure.role || 'notable figure',
              description: figure.description,
              confidence: 0.95,
              relationshipType: 'explicit'
            });
            seenRefs.add(refKey);
          }
        }
      }
    }

    // Add characters from establishments
    if (content.establishments) {
      for (const establishment of content.establishments) {
        if (establishment.proprietor) {
          const character = allData.characters.find(c =>
            normalizeForComparison(c.name) === normalizeForComparison(establishment.proprietor)
          );
          if (character) {
            const refKey = `people-${character.id}`;
            if (!seenRefs.has(refKey)) {
              references.push({
                id: character.id,
                name: character.name,
                category: 'people',
                relationship: `proprietor of ${establishment.name}`,
                description: `Runs ${establishment.name} in ${content.name}`,
                confidence: 0.9,
                relationshipType: 'explicit'
              });
              seenRefs.add(refKey);
            }
          }
        }
      }
    }
  }

  // 5. Creator-based relationships (limited to avoid clutter)
  if (content.creator && content.creator !== 'Campaign Setting') {
    const creatorEntries = allEntries.filter(e =>
      e.creator === content.creator && e.id !== content.id
    ).slice(0, 3); // Limit to top 3

    for (const entry of creatorEntries) {
      const refKey = `${entry.category}-${entry.id}`;
      if (!seenRefs.has(refKey)) {
        references.push({
          id: entry.id,
          name: entry.name,
          category: entry.category,
          relationship: `created by ${content.creator}`,
          confidence: 0.6,
          relationshipType: 'created_by'
        });
        seenRefs.add(refKey);
      }
    }
  }

  // Sort by confidence and relationship type priority
  return references.sort((a, b) => {
    const typePriority = {
      explicit: 5,
      family: 4,
      political: 3,
      geographic: 2,
      mentioned: 1,
      created_by: 0,
      inferred: 0
    };

    const aPriority = typePriority[a.relationshipType] || 0;
    const bPriority = typePriority[b.relationshipType] || 0;

    if (aPriority !== bPriority) return bPriority - aPriority;
    return b.confidence - a.confidence;
  });
}

// Helper functions
function findEntryByName(name: string, allData: any): any {
  const normalizedName = normalizeForComparison(name);

  const allEntries = [
    ...allData.characters.map((c: any) => ({ ...c, category: 'people' })),
    ...allData.locations.map((l: any) => ({ ...l, category: 'places' })),
    ...allData.items.map((i: any) => ({ ...i, category: 'items' })),
    ...allData.adventures.map((a: any) => ({ ...a, category: 'adventures' })),
    ...allData.organizations.map((o: any) => ({ ...o, category: 'organizations' }))
  ];

  return allEntries.find(entry =>
    normalizeForComparison(entry.name) === normalizedName ||
    normalizeForComparison(entry.name).includes(normalizedName) ||
    normalizedName.includes(normalizeForComparison(entry.name))
  );
}

function normalizeForComparison(text: string): string {
  return text.toLowerCase()
    .replace(/["""'']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractContext(text: string, name: string): string {
  const index = text.toLowerCase().indexOf(name.toLowerCase());
  if (index === -1) return '';

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + name.length + 50);
  return text.substring(start, end);
}

function inferRelationshipType(context: string, category: ContentCategory): EnhancedCrossReference['relationshipType'] {
  const lowerContext = context.toLowerCase();

  if (/\b(father|mother|son|daughter|brother|sister|wife|husband|family)\b/.test(lowerContext)) {
    return 'family';
  }
  if (/\b(king|queen|rules|governs|commands|serves|advisor|minister)\b/.test(lowerContext)) {
    return 'political';
  }
  if (/\b(in|at|from|of|located|within|near)\b/.test(lowerContext)) {
    return 'geographic';
  }
  if (/\b(created|made|forged|crafted|built)\b/.test(lowerContext)) {
    return 'created_by';
  }

  return 'mentioned';
}

function generateContextualRelationship(context: string, category: ContentCategory): string {
  const lowerContext = context.toLowerCase();

  // Family relationships
  if (lowerContext.includes('father')) return 'father';
  if (lowerContext.includes('mother')) return 'mother';
  if (lowerContext.includes('son')) return 'son';
  if (lowerContext.includes('daughter')) return 'daughter';
  if (lowerContext.includes('brother')) return 'brother';
  if (lowerContext.includes('sister')) return 'sister';
  if (lowerContext.includes('wife')) return 'wife';
  if (lowerContext.includes('husband')) return 'husband';

  // Political relationships
  if (lowerContext.includes('rules')) return 'ruler of';
  if (lowerContext.includes('governs')) return 'governor of';
  if (lowerContext.includes('commands')) return 'commander of';
  if (lowerContext.includes('serves')) return 'serves';
  if (lowerContext.includes('advisor')) return 'advisor to';

  // Geographic relationships
  if (lowerContext.includes('located in')) return 'located in';
  if (lowerContext.includes('from')) return 'from';
  if (lowerContext.includes(' of ')) return 'associated with';

  // Default based on category
  switch (category) {
    case 'people': return 'associated character';
    case 'places': return 'associated location';
    case 'items': return 'related item';
    case 'adventures': return 'related adventure';
    case 'organizations': return 'related organization';
    default: return 'mentioned';
  }
}

function generateRelationshipDescription(type: string, matchText: string): string {
  switch (type) {
    case 'family': return 'family member';
    case 'political': return 'political relationship';
    case 'geographic': return 'geographic connection';
    case 'created_by': return 'creator relationship';
    default: return 'related';
  }
}

function calculateConfidence(name: string, text: string, context: string): number {
  let confidence = 0.5; // Base confidence

  // Boost for exact name matches
  if (text.includes(name)) confidence += 0.2;

  // Boost for context clues
  if (context.length > 20) confidence += 0.1;

  // Boost for proper nouns (capitalized)
  if (/^[A-Z]/.test(name)) confidence += 0.1;

  // Reduce for very short names (likely false positives)
  if (name.length < 4) confidence -= 0.2;

  return Math.min(1.0, Math.max(0.1, confidence));
}