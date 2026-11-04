const fs = require('fs');

function fixClosingScriptTags(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace any literal </script> inside document.write or template literals
  content = content.replace(/<script>\s*window\.onload\s*=\s*function\(\)\s*\{\s*window\.print\(\);\s*\}\s*<\/script>/g,
    '<script>\\n            window.onload = function() { window.print(); }\\n          <\\/script>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed closing script tags in ${filePath}`);
}

fixClosingScriptTags('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html');
fixClosingScriptTags('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/_x9mq.html');
