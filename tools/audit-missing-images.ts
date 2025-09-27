#!/usr/bin/env tsx
/**
 * Enhanced Image Asset Audit Tool
 * Generates prioritized queue for missing character portraits
 */

import fs from 'fs-extra';
import path from 'path';
import { characters } from '../src/data/characters.ts';

interface ImageAuditResult {
  characterId: string;
  name: string;
  hasImage: boolean;
  imagePath?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  importance: number;
}

interface PriorityQueue {
  critical: ImageAuditResult[];
  high: ImageAuditResult[];
  medium: ImageAuditResult[];
  low: ImageAuditResult[];
}

const IMAGE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg'];
const CHARACTERS_DIR = path.join(process.cwd(), 'public', 'images', 'characters');

// Priority scoring based on character importance
const PRIORITY_KEYWORDS = {
  critical: ['king', 'queen', 'high king', 'ruler', 'emperor', 'empress'],
  high: ['prince', 'princess', 'duke', 'duchess', 'lord', 'lady', 'captain', 'commander', 'high priest', 'archmage', 'master'],
  medium: ['elder', 'advisor', 'ambassador', 'professor', 'magister', 'headmaster', 'chancellor'],
  low: ['scribe', 'guard', 'merchant', 'citizen']
};

function calculatePriority(character: any): 'critical' | 'high' | 'medium' | 'low' {
  const nameAndDesc = `${character.name} ${character.description || ''}`.toLowerCase();

  // Check for critical keywords first
  if (PRIORITY_KEYWORDS.critical.some(keyword => nameAndDesc.includes(keyword))) {
    return 'critical';
  }

  if (PRIORITY_KEYWORDS.high.some(keyword => nameAndDesc.includes(keyword))) {
    return 'high';
  }

  if (PRIORITY_KEYWORDS.medium.some(keyword => nameAndDesc.includes(keyword))) {
    return 'medium';
  }

  return 'low';
}

function calculateImportanceScore(character: any): number {
  let score = 0;
  const nameAndDesc = `${character.name} ${character.description || ''}`.toLowerCase();

  // Base scoring
  if (PRIORITY_KEYWORDS.critical.some(keyword => nameAndDesc.includes(keyword))) score += 100;
  if (PRIORITY_KEYWORDS.high.some(keyword => nameAndDesc.includes(keyword))) score += 50;
  if (PRIORITY_KEYWORDS.medium.some(keyword => nameAndDesc.includes(keyword))) score += 25;

  // Bonus for specific factions/locations
  if (nameAndDesc.includes('gulanbarak') || nameAndDesc.includes('ironhammer')) score += 20;
  if (nameAndDesc.includes('avalon')) score += 15;
  if (nameAndDesc.includes('dale lands')) score += 10;

  // Bonus for having relationships/interactions
  if (character.description && character.description.length > 200) score += 10;

  return score;
}

function findImageFile(characterName: string): string | null {
  // Clean the character name for file matching
  const cleanName = characterName
    .replace(/"/g, '') // Remove quotes
    .replace(/\\/g, '') // Remove backslashes
    .trim();

  for (const ext of IMAGE_EXTENSIONS) {
    const imagePath = path.join(CHARACTERS_DIR, `${cleanName}${ext}`);
    if (fs.existsSync(imagePath)) {
      return imagePath;
    }
  }

  return null;
}

async function auditImages(): Promise<PriorityQueue> {
  console.log('🔍 Starting enhanced image asset audit...');

  const results: ImageAuditResult[] = [];
  let totalCharacters = 0;
  let charactersWithImages = 0;

  for (const character of characters) {
    totalCharacters++;

    const imagePath = findImageFile(character.name);
    const hasImage = imagePath !== null;

    if (hasImage) {
      charactersWithImages++;
    }

    const priority = calculatePriority(character);
    const importance = calculateImportanceScore(character);

    results.push({
      characterId: character.id,
      name: character.name,
      hasImage,
      imagePath: imagePath || undefined,
      priority,
      category: character.category || 'npc',
      importance
    });
  }

  // Separate into missing and existing
  const missingImages = results.filter(r => !r.hasImage);
  const existingImages = results.filter(r => r.hasImage);

  // Sort missing images by priority and importance
  const priorityQueue: PriorityQueue = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  missingImages.forEach(result => {
    priorityQueue[result.priority].push(result);
  });

  // Sort each priority level by importance score
  Object.keys(priorityQueue).forEach(priority => {
    priorityQueue[priority as keyof PriorityQueue].sort((a, b) => b.importance - a.importance);
  });

  // Generate report
  console.log('\n📊 Image Asset Audit Results:');
  console.log(`Total Characters: ${totalCharacters}`);
  console.log(`Characters with Images: ${charactersWithImages}`);
  console.log(`Characters Missing Images: ${missingImages.length}`);
  console.log(`Coverage: ${((charactersWithImages / totalCharacters) * 100).toFixed(1)}%`);

  console.log('\n🎯 Missing Images by Priority:');
  console.log(`Critical: ${priorityQueue.critical.length}`);
  console.log(`High: ${priorityQueue.high.length}`);
  console.log(`Medium: ${priorityQueue.medium.length}`);
  console.log(`Low: ${priorityQueue.low.length}`);

  return priorityQueue;
}

async function generateReports(priorityQueue: PriorityQueue): Promise<void> {
  const reportsDir = path.join(process.cwd(), 'reports');
  await fs.ensureDir(reportsDir);

  // Generate priority queue JSON
  const queuePath = path.join(reportsDir, 'image-priority-queue.json');
  await fs.writeJson(queuePath, priorityQueue, { spaces: 2 });

  // Generate character importance matrix
  const allMissing = [
    ...priorityQueue.critical,
    ...priorityQueue.high,
    ...priorityQueue.medium,
    ...priorityQueue.low
  ];

  const importanceMatrix = allMissing.map(char => ({
    name: char.name,
    priority: char.priority,
    importance: char.importance,
    category: char.category
  }));

  const matrixPath = path.join(reportsDir, 'character-importance-matrix.json');
  await fs.writeJson(matrixPath, importanceMatrix, { spaces: 2 });

  // Generate human-readable report
  const reportLines = [
    '# Image Asset Priority Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Critical Priority (Create First)',
    ...priorityQueue.critical.map(char => `- ${char.name} (Score: ${char.importance})`),
    '',
    '## High Priority',
    ...priorityQueue.high.map(char => `- ${char.name} (Score: ${char.importance})`),
    '',
    '## Medium Priority',
    ...priorityQueue.medium.map(char => `- ${char.name} (Score: ${char.importance})`),
    '',
    '## Low Priority',
    ...priorityQueue.low.map(char => `- ${char.name} (Score: ${char.importance})`),
    '',
    '## Implementation Recommendations',
    '',
    '1. **Phase 1**: Create all Critical priority portraits (immediate impact)',
    '2. **Phase 2**: Create High priority portraits (major characters)',
    '3. **Phase 3**: Create Medium priority portraits (supporting characters)',
    '4. **Phase 4**: Create Low priority portraits (background characters)',
    '',
    '## Estimated Time Investment',
    '',
    `- Critical: ${priorityQueue.critical.length} × 30min = ${(priorityQueue.critical.length * 0.5).toFixed(1)} hours`,
    `- High: ${priorityQueue.high.length} × 20min = ${(priorityQueue.high.length * 0.33).toFixed(1)} hours`,
    `- Medium: ${priorityQueue.medium.length} × 15min = ${(priorityQueue.medium.length * 0.25).toFixed(1)} hours`,
    `- Low: ${priorityQueue.low.length} × 10min = ${(priorityQueue.low.length * 0.17).toFixed(1)} hours`,
    '',
    `**Total Estimated Time**: ${(
      priorityQueue.critical.length * 0.5 +
      priorityQueue.high.length * 0.33 +
      priorityQueue.medium.length * 0.25 +
      priorityQueue.low.length * 0.17
    ).toFixed(1)} hours`
  ];

  const reportPath = path.join(reportsDir, 'image-priority-report.md');
  await fs.writeFile(reportPath, reportLines.join('\n'));

  console.log('\n📝 Reports Generated:');
  console.log(`- Priority Queue: ${queuePath}`);
  console.log(`- Importance Matrix: ${matrixPath}`);
  console.log(`- Human Report: ${reportPath}`);
}

async function main() {
  try {
    const priorityQueue = await auditImages();
    await generateReports(priorityQueue);

    console.log('\n✅ Asset audit and prioritization complete!');
    console.log('\nNext Steps:');
    console.log('1. Review reports/image-priority-report.md');
    console.log('2. Begin with Critical priority characters');
    console.log('3. Use AI generation tools for batch processing');

  } catch (error) {
    console.error('❌ Error during audit:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { auditImages, generateReports };