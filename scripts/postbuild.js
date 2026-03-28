const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'release-builds', 'Videify-win32-x64');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const foldersToCopy = ['views', 'public', 'scripts', 'data'];
const filesToCopy = ['instalar_dependencias.bat'];

console.log('--- Starting Post-Build Asset Copy ---');

if (!fs.existsSync(BUILD_DIR)) {
  console.error(`Build directory not found: ${BUILD_DIR}`);
  console.log('Skipping asset copy. Make sure you ran the build command first.');
  process.exit(0);
}

foldersToCopy.forEach(folder => {
  const src = path.join(__dirname, '..', folder);
  const dest = path.join(BUILD_DIR, folder);
  console.log(`Copying folder: ${folder} -> ${dest}`);
  copyRecursiveSync(src, dest);
});

filesToCopy.forEach(file => {
  const src = path.join(__dirname, '..', file);
  const dest = path.join(BUILD_DIR, file);
  console.log(`Copying file: ${file} -> ${dest}`);
  fs.copyFileSync(src, dest);
});

console.log('--- Post-Build Asset Copy Finished Successfully ---');
