const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const replaceTarget = (target, replacement) => {
    if (content.includes(target)) {
      content = content.split(target).join(replacement);
      modified = true;
    }
  };

  // Replace default black texts and icon colors with Navy Blue
  replaceTarget('#1C1C1C', '#182F4B');
  replaceTarget('color="#000000"', 'color="#182F4B"');
  replaceTarget('text-black', 'text-[#182F4B]');

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
let tailwindPath = path.join(__dirname, 'tailwind.config.js');
let twContent = fs.readFileSync(tailwindPath, 'utf8');
if (twContent.includes('#1C1C1C')) {
  twContent = twContent.split('#1C1C1C').join('#182F4B');
  fs.writeFileSync(tailwindPath, twContent, 'utf8');
  console.log('Updated tailwind.config.js');
}

console.log('Done replacing blacks with Navy Blue.');
