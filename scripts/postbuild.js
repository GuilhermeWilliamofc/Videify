const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'release-builds', 'Videify-win32-x64');
const RESOURCES_APP_DIR = path.join(BUILD_DIR, 'resources', 'app');

console.log('--- Starting Post-Build Cleanup ---');

if (!fs.existsSync(BUILD_DIR)) {
  console.error(`Build directory not found: ${BUILD_DIR}`);
  console.log('Skipping cleanup. Make sure you ran the build command first.');
  process.exit(0);
}

// Remove pastas desnecessárias de resources/app
const foldersToRemove = ['.venv', 'docs', 'downloads', 'release-builds'];
const filesToRemove = ['.gitattributes', 'README.md', 'restart.bat', '.gitignore'];

console.log('Removing unnecessary files from resources/app...');
foldersToRemove.forEach(folder => {
  const folderPath = path.join(RESOURCES_APP_DIR, folder);
  if (fs.existsSync(folderPath)) {
    console.log(`  Removing: ${folder}/`);
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
});

filesToRemove.forEach(file => {
  const filePath = path.join(RESOURCES_APP_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`  Removing: ${file}`);
    fs.unlinkSync(filePath);
  }
});

// Remove a pasta data/ antiga se existir (agora usa %APPDATA%)
const oldDataDir = path.join(RESOURCES_APP_DIR, 'data');
if (fs.existsSync(oldDataDir)) {
  console.log('  Removing old data/ directory (app uses %APPDATA% now)');
  fs.rmSync(oldDataDir, { recursive: true, force: true });
}

// Informações sobre o build
console.log('\n--- Build Statistics ---');
const getDirectorySize = (dirPath) => {
  let size = 0;
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  });
  return size;
};

const totalSize = getDirectorySize(BUILD_DIR);
const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log(`Total build size: ${totalSizeMB} MB`);
console.log(`Build location: ${BUILD_DIR}`);
console.log('\n--- Post-Build Cleanup Finished Successfully ---');
