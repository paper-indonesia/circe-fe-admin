const fs = require('fs');
const path = require('path');

// Read the raw Privacy Policy file
const rawContent = fs.readFileSync(
  path.join(__dirname, '..', 'privacy.md'),
  'utf-8'
);

const lines = rawContent.split('\n');

const privacyData = {
  title: '',
  sections: []
};

let currentSection = null;
let bufferLines = [];

// Helper function to parse section content into structured parts
function parseSectionContent(content) {
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length === 0) {
    return { intro: '', items: [], conclusion: '' };
  }

  // If only 1 line, return as intro
  if (lines.length === 1) {
    return { intro: lines[0], items: [], conclusion: '' };
  }

  // Detect if content has intro text (ends with ':')
  const firstLine = lines[0];
  const hasIntro = firstLine.endsWith(':') || firstLine.includes('untuk:') ||
                   firstLine.includes('dengan:') || firstLine.includes('berikut:') ||
                   firstLine.includes('pada:') || firstLine.includes('atas:');

  let intro = '';
  let items = [];
  let conclusion = '';
  let startIdx = 0;

  if (hasIntro) {
    intro = firstLine;
    startIdx = 1;

    // After intro line ending with ":", collect list items
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if this line is a conclusion paragraph (long sentence with periods)
      const likelyParagraph = line.length > 120 && line.includes('.') &&
                             !line.match(/^[A-Za-z]\.\s/) && // not "a. something"
                             line.split('.').length > 1; // has multiple sentences

      if (likelyParagraph) {
        // This is definitely a conclusion paragraph, stop collecting items
        break;
      }

      // Check if this line is a list item
      const hasBullet = /^[a-z]\)/.test(line) || /^[•\-–—]/.test(line);
      const isShort = line.length < 120; // List items are typically short

      if (hasBullet || isShort) {
        // This is a list item
        const cleanedLine = line.replace(/^[a-z]\)\s*/, '')
                                .replace(/^[•\-–—]\s*/, '');
        items.push(cleanedLine);
      } else if (items.length > 0) {
        // We already have items, and this line is not short, so it's likely conclusion
        break;
      } else {
        // No clear pattern, add as item
        items.push(line);
      }
    }

    // Extract conclusion (everything after the list)
    const listEndIdx = startIdx + items.length;
    if (listEndIdx < lines.length) {
      conclusion = lines.slice(listEndIdx).join(' ').trim();
    }
  } else {
    // No intro - might be all items, or all prose
    // Check if lines look like a list (multiple short lines)
    const avgLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;
    const hasListMarkers = lines.some(l => /^[a-z]\)/.test(l) || /^[•\-–—]/.test(l));

    if (hasListMarkers || (avgLength < 150 && lines.length > 2)) {
      // Treat as list
      for (const line of lines) {
        const cleanedLine = line.replace(/^[a-z]\)\s*/, '')
                                .replace(/^[•\-–—]\s*/, '');
        items.push(cleanedLine);
      }
    } else {
      // Treat as prose
      intro = content.replace(/\n/g, ' ').trim();
    }
  }

  return { intro, items, conclusion };
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (!line) continue; // Skip empty lines

  // Detect title (first line)
  if (i === 0 || line.includes('Kebijakan Privasi')) {
    privacyData.title = line.replace(/^#\s*/, ''); // Remove markdown heading
    continue;
  }

  // Detect main section (e.g., "1) Ruang Lingkup", "2) Data Pribadi")
  const sectionMatch = line.match(/^(\d+)\)\s+(.+)$/);
  if (sectionMatch) {
    // Save previous section
    if (currentSection) {
      if (bufferLines.length > 0) {
        const rawContent = bufferLines.join('\n').trim();
        const parsed = parseSectionContent(rawContent);
        currentSection.intro = parsed.intro;
        currentSection.items = parsed.items;
        currentSection.conclusion = parsed.conclusion;
        bufferLines = [];
      }
      privacyData.sections.push(currentSection);
    }

    currentSection = {
      number: parseInt(sectionMatch[1]),
      title: sectionMatch[2],
      intro: '',
      items: [],
      conclusion: ''
    };
    continue;
  }

  // Detect subsection (e.g., "a) Data yang Anda berikan", "b) Data yang dikumpulkan")
  const subsectionMatch = line.match(/^([a-z])\)\s+(.+)$/);
  if (subsectionMatch && currentSection) {
    // If we have a subsection, we need to store it as a separate structure
    // For simplicity, let's treat subsections as items with titles
    if (bufferLines.length > 0) {
      // There's content before this subsection, parse it first
      const rawContent = bufferLines.join('\n').trim();
      const parsed = parseSectionContent(rawContent);
      if (!currentSection.intro) {
        currentSection.intro = parsed.intro;
        currentSection.items = parsed.items;
        currentSection.conclusion = parsed.conclusion;
      }
      bufferLines = [];
    }

    // Start collecting subsection content
    bufferLines.push(`**${subsectionMatch[2]}**`); // Mark as bold heading
    continue;
  }

  // Add content to buffer
  if (currentSection) {
    bufferLines.push(line);
  }
}

// Save last section
if (currentSection) {
  if (bufferLines.length > 0) {
    const rawContent = bufferLines.join('\n').trim();
    const parsed = parseSectionContent(rawContent);
    currentSection.intro = parsed.intro;
    currentSection.items = parsed.items;
    currentSection.conclusion = parsed.conclusion;
  }
  privacyData.sections.push(currentSection);
}

// Write to JSON file
const outputPath = path.join(__dirname, '..', 'lib', 'privacy-data.json');
fs.writeFileSync(outputPath, JSON.stringify(privacyData, null, 2), 'utf-8');

console.log('✅ Privacy Policy data parsed successfully!');
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Sections: ${privacyData.sections.length}`);

// Show sample of section 2 for verification
const section2 = privacyData.sections.find(s => s.number === 2);
if (section2) {
  console.log('\n📋 Sample - Section 2:');
  console.log('Title:', section2.title);
  console.log('Intro:', section2.intro ? section2.intro.substring(0, 50) + '...' : 'N/A');
  console.log('Items:', section2.items.length, 'items');
  if (section2.items.length > 0) {
    console.log('First item:', section2.items[0].substring(0, 60) + '...');
  }
}
