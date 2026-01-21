const fs = require('fs');
const path = require('path');

function updateImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      updateImports(fullPath);
    } else if (file.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match relative imports: from './something' or from '../something'
      const relativeImportRegex = /from\s+['"](\.\/|\.\.\/)([^'"]+)['"]/g;
      
      content = content.replace(relativeImportRegex, (match, prefix, importPath) => {
        // Skip if already has .js or .json extension, or is an index file
        if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
          return match;
        }
        // Add .js extension
        return match.replace(importPath, importPath + '.js');
      });
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated: ${fullPath}`);
    }
  }
}

updateImports('./src');
console.log('Done updating all imports');
