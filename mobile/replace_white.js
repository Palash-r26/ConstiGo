const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  if (filePath.endsWith('Typography.tsx') || filePath.endsWith('Button.tsx')) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const replaceTarget = (target, replacement) => {
    if (content.includes(target)) {
      content = content.split(target).join(replacement);
      modified = true;
    }
  };

  replaceTarget('text-white', 'text-[#12294A]');
  replaceTarget('color="#FFF"', 'color="#12294A"');
  replaceTarget('color="#FFFFFF"', 'color="#12294A"');

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
console.log('Done replacing white text/icons with blue.');
