import {build} from 'esbuild';
await build({entryPoints:['src/documents-client.mjs'],bundle:true,format:'iife',platform:'browser',target:['es2022'],minify:true,outfile:'public/vendor/student-documents.js',legalComments:'linked'});
