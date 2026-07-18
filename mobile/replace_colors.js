const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const oldPrimary = '#9C101A';
const newPrimary = '#DFA128'; // Yellow
const oldAccent = '#FF4B3A';
const newAccent = '#12294A'; // Blue

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  if (content.includes(oldPrimary)) {
    content = content.split(oldPrimary).join(newPrimary);
    modified = true;
  }
  
  if (content.includes(oldAccent)) {
    content = content.split(oldAccent).join(newAccent);
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

// Also replace in tailwind.config.js
replaceInFile(path.join(__dirname, 'tailwind.config.js'));
console.log('Done.');
