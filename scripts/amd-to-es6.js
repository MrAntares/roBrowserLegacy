const fs = require('fs');
const path = require('path');

/**
 * Basic AMD to ES6 converter for roBrowserLegacy
 * Handles:
 * define(['dep1', 'dep2'], function(Dep1, Dep2) { ... return Export; });
 * define(function() { ... return Export; });
 */

function convertFile(filePath) {
	if (!fs.existsSync(filePath)) {
		console.error(`File not found: ${filePath}`);
		return;
	}

	let content = fs.readFileSync(filePath, 'utf8');

	// 1. Detect define structure
    // Find the first occurrence of define( and the last occurrence of );
    const firstDefine = content.indexOf('define(');
    const lastClosing = content.lastIndexOf('});');
    
    if (firstDefine === -1 || lastClosing === -1) {
		console.log(`Skipping ${filePath}: No standard define() found or already converted.`);
		return;
	}

    const headerComment = content.substring(0, firstDefine);
    const defineBlock = content.substring(firstDefine, lastClosing + 3);
    const trailingContent = content.substring(lastClosing + 3);

	const defineRegex = /define\s*\(\s*(?:\[([\s\S]*?)\]\s*,\s*)?function\s*\(([\s\S]*?)\)\s*\{([\s\S]*)\}\s*\)\s*;?$/;
	const match = defineBlock.match(defineRegex);

	if (!match) {
		console.log(`Skipping ${filePath}: define() structure not recognized.`);
		return;
	}

	let depsRaw = match[1] ? match[1].split(',').map(s => s.trim().replace(/['"]/g, '')) : [];
	let argsRaw = match[2] ? match[2].split(',').map(s => s.trim()) : [];
	let body = match[3];

	// 2. Build imports
	let imports = [];
    
    // Handle standard dependency array
	for (let i = 0; i < depsRaw.length; i++) {
		let dep = depsRaw[i];
		const arg = argsRaw[i];
		
		if (dep.startsWith('text!')) {
			dep = dep.substring(5) + '?raw';
		}
		
		if (arg) {
			imports.push(`import ${arg} from '${dep}';`);
		} else {
			imports.push(`import '${dep}';`);
		}
	}

    // Handle internal require() calls (CJS wrapper)
    // var/const/let Dep = require('dep');
    const internalRequireRegex = /^\s*(?:var|const|let)\s+([a-zA-Z0-9_$]+)\s*=\s*require\s*\(\s*['"](.*?)['"]\s*\)\s*;?\s*$/gm;
    let internalMatch;
    while ((internalMatch = internalRequireRegex.exec(body)) !== null) {
        const arg = internalMatch[1];
        let dep = internalMatch[2];
        
        if (dep.startsWith('text!')) {
            dep = dep.substring(5) + '?raw';
        }
        
        imports.push(`import ${arg} from '${dep}';`);
    }
    // Remove the internal require calls from body
    body = body.replace(internalRequireRegex, '');

    // Handle standalone require() like: require('Vendors/jquery');
    const standaloneRequireRegex = /^\s*require\s*\(\s*['"](.*?)['"]\s*\)\s*;?\s*$/gm;
    while ((internalMatch = standaloneRequireRegex.exec(body)) !== null) {
        const dep = internalMatch[1];
        imports.push(`import '${dep}';`);
    }
    body = body.replace(standaloneRequireRegex, '');

	// 2.5 Remove legacy module aliases and comments
	body = body.replace(/^\s*(?:var|const|let)\s+getModule\s*=\s*require\s*;?\s*$/gm, '');
	body = body.replace(/^\s*\/\*\*\s*\n\s*\*\s*Dependencies\s*\n\s*\*\/\s*$/gm, '');

	// 2.6 Convert var to let
	body = body.replace(/^(\s*)var\s+/gm, '$1let ');

	// 3. Handle 'use strict'
	let header = "";
	if (body.trim().startsWith("'use strict'") || body.trim().startsWith('"use strict"')) {
		header = "'use strict';\n\n";
		body = body.replace(/^\s*['"]use strict['"];?\s*/, '');
	}
    
    // Filter out 'require' from imports if it was passed as an argument in define(function(require) { ... })
    imports = imports.filter(imp => !imp.includes('from \'require\'') && !imp.startsWith('import require from'));

	// 4. Handle return statement (last one in the block)
	let footer = "";
    
    // Use a regex that specifically looks for the "Export" comment block at the end
    // Use \s+ to be flexible with indentation and line breaks
    const exportBlockRegex = /\/\*\*\s*\*\s*Export(.*?)\s*\*\/\s*return\s+([\s\S]+)$/m;
    const exportBlockMatch = body.match(exportBlockRegex);
    
    if (exportBlockMatch) {
        const commentSuffix = exportBlockMatch[1].trim(); 
        const val = exportBlockMatch[2].trim().replace(/;$/, '');
        body = body.replace(exportBlockRegex, (match) => {
            return `/**\n\t * Export ${commentSuffix}\n\t */\n\texport default ${val};`;
        });
    } else {
        // Fallback: match the VERY last return at the top-level of the define function
        // We split by lines to be very precise about finding the last one indented by exactly 1 level
        const lines = body.split(/\r?\n/);
        let lastReturnIdx = -1;
        
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].match(/^(?:\t| {4})return\s+/)) {
                lastReturnIdx = i;
                break;
            }
        }

        if (lastReturnIdx !== -1) {
            // Reconstruct the export value from the last return line to the end of the body
            const exportValueLines = [lines[lastReturnIdx].replace(/^(?:\t| {4})return\s+/, ''), ...lines.slice(lastReturnIdx + 1)];
            const exportValue = exportValueLines.join('\n').trim().replace(/;?\s*$/, '');
            
            // Reconstruct the body without the export part
            body = lines.slice(0, lastReturnIdx).join('\n');
            footer = `\nexport default ${exportValue};`;
        }
    }

	let transformed = headerComment + header + imports.join('\n') + (imports.length ? '\n\n' : '') + body.trim() + footer;

	fs.writeFileSync(filePath, transformed, 'utf8');
	console.log(`Converted: ${filePath}`);
}

const target = process.argv[2];
if (!target) {
	console.log("Usage: node scripts/amd-to-es6.js <file-or-directory>");
	process.exit(1);
}

if (fs.lstatSync(target).isDirectory()) {
    // For now, let's just make it simple - run on a file or recursively?
    // roBrowser has a specific structure, let's just do single file for now to be safe.
    console.log("Directory support not fully implemented yet for safety. Please provide a file.");
} else {
    convertFile(target);
}
