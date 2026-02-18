const fs = require('fs');
const path = require('path');

function ensureHermesVersion() {
  const projectRoot = path.resolve(__dirname, '..');
  const hermesPkgPath = path.join(projectRoot, 'node_modules', 'hermes-engine', 'package.json');
  const targetDir = path.join(projectRoot, 'node_modules', 'react-native', 'sdks', 'hermes-engine');
  const targetFile = path.join(targetDir, 'version.properties');

  let version = '0.11.0';
  try {
    if (fs.existsSync(hermesPkgPath)) {
      const hermesPkg = require(hermesPkgPath);
      if (hermesPkg && hermesPkg.version) version = hermesPkg.version;
    }
  } catch (e) {
    // fall back to default
  }

  try {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    const content = `hermes.version=${version}\n`;
    fs.writeFileSync(targetFile, content, { encoding: 'utf8' });
    console.log(`Ensured Hermes version file at ${targetFile}`);
  } catch (err) {
    console.error('Failed to ensure Hermes version file:', err);
    process.exitCode = 1;
  }
}

ensureHermesVersion();
