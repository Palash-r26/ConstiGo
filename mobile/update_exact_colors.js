const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const oldYellow = '#DFA128';
const newYellow = '#C89338'; 
const oldBlue = '#12294A';
const newBlue = '#182F4B'; 

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  if (content.includes(oldYellow)) {
    content = content.split(oldYellow).join(newYellow);
    modified = true;
  }
  
  if (content.includes(oldBlue)) {
    content = content.split(oldBlue).join(newBlue);
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
