// Add support for node.js + requirejs
window.gui = require('nw.gui');
window.requireNode = window.require;
delete window.require;
 
window.requireNode.version = process.versions.node;
delete process.versions.node;

globalThis.__process = globalThis.process;
delete globalThis.process;