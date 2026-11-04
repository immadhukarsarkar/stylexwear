const fs = require('fs');

function fixScriptPlacement(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Find the accidentally injected statement scripts in feather-icons
  const badFeather = `<script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js">
    // Statement Engine & Date Filter Handlers`;

  if (html.includes(badFeather)) {
    // Extract statement scripts
    const startIdx = html.indexOf('// Statement Engine & Date Filter Handlers');
    const endMarker = 'showToast(\'✅ Filtered Statement CSV downloaded!\');\n    }';
    const endIdx = html.indexOf(endMarker);

    let statementScripts = '';
    if (startIdx !== -1 && endIdx !== -1) {
      statementScripts = html.slice(startIdx, endIdx + endMarker.length);
    }

    // Clean up feather script tag
    html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/feather-icons\/dist\/feather\.min\.js">[\s\S]*?<\/script>/,
      '<script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>');

    // Insert statementScripts right before the LAST </script> tag
    const lastScriptIdx = html.lastIndexOf('</script>');
    if (lastScriptIdx !== -1 && statementScripts) {
      html = html.slice(0, lastScriptIdx) + '\n\n    ' + statementScripts + '\n  ' + html.slice(lastScriptIdx);
    }

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Cleaned up script placement in ${filePath}`);
  }
}

fixScriptPlacement('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/admin.html');
fixScriptPlacement('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/_x9mq.html');
