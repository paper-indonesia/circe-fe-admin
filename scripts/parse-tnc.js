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
        currentSubsection.content = bufferLines.join('\n').trim();
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
      currentSubsection.content = bufferLines.join('\n').trim();
      bufferLines = [];
    }

    currentSubsection = {
      number: `${subsectionMatch[1]}.${subsectionMatch[2]}`,
      title: subsectionMatch[3],
      content: '',
      items: []
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
      const [term, definition] = line.split(':');
      currentSection.subsections.push({
        term: term.trim(),
        definition: definition.trim()
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
    currentSubsection.content = bufferLines.join('\n').trim();
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
