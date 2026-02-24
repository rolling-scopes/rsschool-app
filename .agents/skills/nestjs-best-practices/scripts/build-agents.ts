#!/usr/bin/env npx ts-node

/**
 * Build script for generating AGENTS.md from individual rule files
 *
 * Usage: npx ts-node scripts/build-agents.ts
 *
 * This script:
 * 1. Reads all rule files from the rules/ directory
 * 2. Parses YAML frontmatter for metadata
 * 3. Groups rules by category based on filename prefix
 * 4. Generates a consolidated AGENTS.md file
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Category definitions with ordering and metadata
const CATEGORIES = [
  { prefix: 'arch-', name: 'Architecture', impact: 'CRITICAL', section: 1 },
  { prefix: 'di-', name: 'Dependency Injection', impact: 'CRITICAL', section: 2 },
  { prefix: 'error-', name: 'Error Handling', impact: 'HIGH', section: 3 },
  { prefix: 'security-', name: 'Security', impact: 'HIGH', section: 4 },
  { prefix: 'perf-', name: 'Performance', impact: 'HIGH', section: 5 },
  { prefix: 'test-', name: 'Testing', impact: 'MEDIUM-HIGH', section: 6 },
  { prefix: 'db-', name: 'Database & ORM', impact: 'MEDIUM-HIGH', section: 7 },
  { prefix: 'api-', name: 'API Design', impact: 'MEDIUM', section: 8 },
  { prefix: 'micro-', name: 'Microservices', impact: 'MEDIUM', section: 9 },
  { prefix: 'devops-', name: 'DevOps & Deployment', impact: 'LOW-MEDIUM', section: 10 },
];

interface RuleFrontmatter {
  title: string;
  impact: string;
  impactDescription: string;
  tags: string[];
}

interface Rule {
  filename: string;
  frontmatter: RuleFrontmatter;
  content: string;
  category: string;
  categorySection: number;
}

function parseFrontmatter(content: string): { frontmatter: RuleFrontmatter | null; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: null, body: content };
  }

  const frontmatterStr = match[1];
  const body = match[2];

  // Simple YAML parsing for our expected format
  const frontmatter: Partial<RuleFrontmatter> = {};
  const lines = frontmatterStr.split('\n');
  let currentKey = '';
  let inArray = false;
  const arrayItems: string[] = [];

  for (const line of lines) {
    if (line.match(/^[a-zA-Z]+:/)) {
      // Save previous array if we were collecting one
      if (inArray && currentKey === 'tags') {
        frontmatter.tags = arrayItems;
      }
      inArray = false;
      arrayItems.length = 0;

      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key.trim();

      if (value === '') {
        // Might be start of array
        inArray = true;
      } else {
        (frontmatter as any)[currentKey] = value;
      }
    } else if (inArray && line.trim().startsWith('-')) {
      arrayItems.push(line.trim().replace(/^-\s*/, ''));
    }
  }

  // Save final array if needed
  if (inArray && currentKey === 'tags') {
    frontmatter.tags = arrayItems;
  }

  return {
    frontmatter: frontmatter as RuleFrontmatter,
    body: body.trim()
  };
}

function getCategoryForFile(filename: string): { name: string; section: number } | null {
  for (const cat of CATEGORIES) {
    if (filename.startsWith(cat.prefix)) {
      return { name: cat.name, section: cat.section };
    }
  }
  return null;
}

function readMetadata(): any {
  const metadataPath = path.join(__dirname, '..', 'metadata.json');
  return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
}

function readRules(): Rule[] {
  const rulesDir = path.join(__dirname, '..', 'rules');
  const files = fs.readdirSync(rulesDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'));

  const rules: Rule[] = [];

  for (const file of files) {
    const filePath = path.join(rulesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);

    if (!frontmatter) {
      console.warn(`Warning: No frontmatter found in ${file}`);
      continue;
    }

    const category = getCategoryForFile(file);
    if (!category) {
      console.warn(`Warning: Unknown category for ${file}`);
      continue;
    }

    rules.push({
      filename: file,
      frontmatter,
      content: body,
      category: category.name,
      categorySection: category.section
    });
  }

  return rules;
}

function generateTableOfContents(rulesByCategory: Map<string, Rule[]>): string {
  let toc = '## Table of Contents\n\n';

  for (const cat of CATEGORIES) {
    const rules = rulesByCategory.get(cat.name);
    if (!rules || rules.length === 0) continue;

    // Section anchor format: #1-architecture
    const sectionAnchor = `${cat.section}-${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    toc += `${cat.section}. [${cat.name}](#${sectionAnchor}) — **${cat.impact}**\n`;

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      // Rule anchor format: #11-rule-title
      const ruleNum = `${cat.section}${i + 1}`;
      const anchor = `${ruleNum}-${rule.frontmatter.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      toc += `   - ${cat.section}.${i + 1} [${rule.frontmatter.title}](#${anchor})\n`;
    }
  }

  return toc;
}

function generateAgentsMd(rules: Rule[], metadata: any): string {
  // Group rules by category
  const rulesByCategory = new Map<string, Rule[]>();

  for (const rule of rules) {
    if (!rulesByCategory.has(rule.category)) {
      rulesByCategory.set(rule.category, []);
    }
    rulesByCategory.get(rule.category)!.push(rule);
  }

  // Sort rules within each category alphabetically
  for (const [category, categoryRules] of rulesByCategory) {
    categoryRules.sort((a, b) => a.filename.localeCompare(b.filename));
  }

  // Build document
  let doc = `# NestJS Best Practices

**Version ${metadata.version}**
${metadata.organization}
${metadata.date}

> **Note:**
> This document is mainly for agents and LLMs to follow when maintaining,
> generating, or refactoring NestJS codebases. Humans may also find it
> useful, but guidance here is optimized for automation and consistency
> by AI-assisted workflows.

---

## Abstract

${metadata.abstract}

---

`;

  // Add table of contents
  doc += generateTableOfContents(rulesByCategory);
  doc += '\n---\n\n';

  // Add rules by category
  for (const cat of CATEGORIES) {
    const categoryRules = rulesByCategory.get(cat.name);
    if (!categoryRules || categoryRules.length === 0) continue;

    doc += `## ${cat.section}. ${cat.name}\n\n`;
    doc += `**Section Impact: ${cat.impact}**\n\n`;

    for (let i = 0; i < categoryRules.length; i++) {
      const rule = categoryRules[i];
      const ruleNumber = `${cat.section}.${i + 1}`;

      // Add rule header with number (anchor will be auto-generated as #11-title)
      doc += `### ${ruleNumber} ${rule.frontmatter.title}\n\n`;
      doc += `**Impact: ${rule.frontmatter.impact}** — ${rule.frontmatter.impactDescription}\n\n`;

      // Add rule content (skip the first header since we already added it)
      let ruleContent = rule.content;
      // Remove the first h1 or h2 header if it matches the title
      ruleContent = ruleContent.replace(/^#{1,2}\s+.*\n+/, '');
      // Remove the impact line if present (we already added it)
      ruleContent = ruleContent.replace(/^\*\*Impact:.*\*\*.*\n+/, '');

      doc += ruleContent;
      doc += '\n\n---\n\n';
    }
  }

  // Add references footer
  doc += `## References

`;
  for (const ref of metadata.references) {
    doc += `- ${ref}\n`;
  }

  doc += `
---

*Generated by build-agents.ts on ${new Date().toISOString().split('T')[0]}*
`;

  return doc;
}

function main() {
  console.log('Building AGENTS.md...\n');

  const metadata = readMetadata();
  console.log(`Version: ${metadata.version}`);
  console.log(`Organization: ${metadata.organization}\n`);

  const rules = readRules();
  console.log(`Found ${rules.length} rules\n`);

  // Count by category
  const counts = new Map<string, number>();
  for (const rule of rules) {
    counts.set(rule.category, (counts.get(rule.category) || 0) + 1);
  }

  console.log('Rules by category:');
  for (const cat of CATEGORIES) {
    const count = counts.get(cat.name) || 0;
    if (count > 0) {
      console.log(`  ${cat.name}: ${count}`);
    }
  }
  console.log('');

  const agentsMd = generateAgentsMd(rules, metadata);

  const outputPath = path.join(__dirname, '..', 'AGENTS.md');
  fs.writeFileSync(outputPath, agentsMd);

  console.log(`Generated AGENTS.md (${agentsMd.length} bytes)`);
  console.log(`Output: ${outputPath}`);
}

main();
