const fs = require('fs');
const path = require('path');

// Read the raw TNC file
const rawContent = fs.readFileSync(
  path.join(__dirname, '..', 'tnc-raw.txt'),
  'utf-8'
);

const lines = rawContent.split('\n');

const tncData = {
  notice: {
    title: '',
    content: []
  },
  sections: []
};

let currentSection = null;
let currentSubsection = null;
let bufferLines = [];
let inNotice = true;

// Helper function to parse subsection content into structured parts
function parseSubsectionContent(content) {
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
                   firstLine.includes('melalui:') || firstLine.includes('bahwa:') ||
                   firstLine.includes('pada:') || firstLine.includes('atas:');

  let intro = '';
  let items = [];
  let conclusion = '';
  let startIdx = 0;

  if (hasIntro) {
    intro = firstLine;
    startIdx = 1;

    // After intro line ending with ":", collect list items
    // List items are typically short lines (< 200 chars) that don't start with capital letter followed by lowercase (new sentence)
    let listEndIdx = startIdx;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if this line is a conclusion paragraph (long sentence with periods)
      const likelyParagraph = line.length > 120 && line.includes('.') &&
                             !line.match(/^[A-Z]\.\s/) && // not "A. something"
                             line.split('.').length > 1; // has multiple sentences

      if (likelyParagraph) {
        // This is definitely a conclusion paragraph, stop collecting items
        break;
      }

      // Check if this line is a list item
      const hasBullet = /^[A-Z]\./.test(line) || /^[•\-–—]/.test(line);
      const isShort = line.length < 100; // List items are typically short

      if (hasBullet || isShort) {
        // This is a list item
        const cleanedLine = line.replace(/^[A-Z]\.\s*/, '')
                                .replace(/^[•\-–—]\s*/, '');
        items.push(cleanedLine);
        listEndIdx = i + 1;
      } else if (items.length > 0) {
        // We already have items, and this line is not short, so it's likely conclusion
        break;
      } else {
        // No clear pattern, add as item
        items.push(line);
        listEndIdx = i + 1;
      }
    }

    // Extract conclusion (everything after the list)
    if (listEndIdx < lines.length) {
      conclusion = lines.slice(listEndIdx).join(' ').trim();
    }
  } else {
    // No intro - might be all items, or all prose
    // Check if lines look like a list (multiple short lines)
    const avgLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;
    const hasListMarkers = lines.some(l => /^[A-Z]\./.test(l) || /^[•\-–—]/.test(l));

    if (hasListMarkers || (avgLength < 150 && lines.length > 2)) {
      // Treat as list
      for (const line of lines) {
        const cleanedLine = line.replace(/^[A-Z]\.\s*/, '')
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
  const line = lines[i].replace(/^→/, '').trim(); // Remove arrows and trim

  if (!line) continue; // Skip empty lines

  // Detect PEMBERITAHUAN PENTING
  if (line.includes('PEMBERITAHUAN PENTING')) {
    tncData.notice.title = line;
    inNotice = true;
    continue;
  }

  // Detect main section (e.g., "1. DEFINISI", "2. RUANG LINGKUP")
  const sectionMatch = line.match(/^(\d+)\.\s+(.+)$/);
  if (sectionMatch) {
    // Save previous section
    if (currentSection) {
      if (currentSubsection && bufferLines.length > 0) {
        const rawContent = bufferLines.join('\n').trim();
        const parsed = parseSubsectionContent(rawContent);
        currentSubsection.intro = parsed.intro;
        currentSubsection.items = parsed.items;
        currentSubsection.conclusion = parsed.conclusion;
        bufferLines = [];
      }
      tncData.sections.push(currentSection);
    }

    inNotice = false;
    currentSection = {
      number: parseInt(sectionMatch[1]),
      title: sectionMatch[2],
      subsections: []
    };
    currentSubsection = null;
    continue;
  }

  // Detect subsection (e.g., "2.1 Persetujuan Syarat", "3.2 Verifikasi Identitas")
  const subsectionMatch = line.match(/^(\d+)\.(\d+)\s+(.+)$/);
  if (subsectionMatch && currentSection) {
    // Save previous subsection
    if (currentSubsection && bufferLines.length > 0) {
      const rawContent = bufferLines.join('\n').trim();
      const parsed = parseSubsectionContent(rawContent);
      currentSubsection.intro = parsed.intro;
      currentSubsection.items = parsed.items;
      currentSubsection.conclusion = parsed.conclusion;
      bufferLines = [];
    }

    currentSubsection = {
      number: `${subsectionMatch[1]}.${subsectionMatch[2]}`,
      title: subsectionMatch[3],
      intro: '',
      items: [],
      conclusion: ''
    };
    currentSection.subsections.push(currentSubsection);
    continue;
  }

  // Add content to notice
  if (inNotice && !tncData.notice.title.includes(line)) {
    tncData.notice.content.push(line);
    continue;
  }

  // For section 1 (DEFINISI), treat each line as a definition
  if (currentSection && currentSection.number === 1 && !currentSubsection) {
    if (line.includes(':')) {
      const colonIdx = line.indexOf(':');
      const term = line.substring(0, colonIdx).trim();
      const definition = line.substring(colonIdx + 1).trim();
      currentSection.subsections.push({
        term: term,
        definition: definition
      });
    }
    continue;
  }

  // Add content to buffer
  if (currentSection) {
    bufferLines.push(line);
  }
}

// Save last section
if (currentSection) {
  if (currentSubsection && bufferLines.length > 0) {
    const rawContent = bufferLines.join('\n').trim();
    const parsed = parseSubsectionContent(rawContent);
    currentSubsection.intro = parsed.intro;
    currentSubsection.items = parsed.items;
    currentSubsection.conclusion = parsed.conclusion;
  } else if (bufferLines.length > 0 && currentSection.subsections.length === 0) {
    currentSection.content = bufferLines.join('\n').trim();
  }
  tncData.sections.push(currentSection);
}

// Finalize notice
tncData.notice.content = tncData.notice.content.join(' ').trim();

// Write to JSON file
const outputPath = path.join(__dirname, '..', 'lib', 'tnc-data.json');
fs.writeFileSync(outputPath, JSON.stringify(tncData, null, 2), 'utf-8');

console.log('✅ TNC data parsed successfully!');
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Sections: ${tncData.sections.length}`);

// Show sample of section 2.2 for verification
const section2 = tncData.sections.find(s => s.number === 2);
if (section2) {
  const subsection22 = section2.subsections.find(s => s.number === '2.2');
  if (subsection22) {
    console.log('\n📋 Sample - Section 2.2:');
    console.log('Intro:', subsection22.intro);
    console.log('Items:', subsection22.items.length, 'items');
    subsection22.items.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item}`);
    });
    console.log('Conclusion:', subsection22.conclusion.substring(0, 80) + '...');
  }
}
