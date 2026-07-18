const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const oldBlue = '#12294A';
const newYellow = '#DFA128'; // Yellow

function replaceInFile(filePath) {
  // Do NOT replace in Button.tsx because Button.tsx requires Blue text for the Yellow button
  // (the "red white combination to yellow and blue comination")
  if (filePath.endsWith('Button.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  if (content.includes(oldBlue)) {
    content = content.split(oldBlue).join(newYellow);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

traverseDirectory(directoryPath);

// Update tailwind.config.js
let tailwindContent = fs.readFileSync(path.join(__dirname, 'tailwind.config.js'), 'utf8');
if (tailwindContent.includes(oldBlue)) {
  tailwindContent = tailwindContent.split(oldBlue).join(newYellow);
  fs.writeFileSync(path.join(__dirname, 'tailwind.config.js'), tailwindContent, 'utf8');
  console.log('Updated tailwind.config.js');
}

console.log('Done reverting stray blues to yellow.');
