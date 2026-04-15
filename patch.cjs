const fs = require('fs');

let code = fs.readFileSync('capture.js', 'utf8');

// Match window.figma.captureForDesign=XXX
const match = code.match(/window\.figma\.captureForDesign=([a-zA-Z_$]+),/);
if (match) {
  const prName = match[1];
  
  // Find the clipboard flow function by looking for the destructuring assignment:
  // let{promise:...,showSuccess:...}=XXX(
  const flowMatch = code.match(/let\{promise:[a-zA-Z_$]+,showSuccess:[a-zA-Z_$]+\}=([a-zA-Z_$]+)\(/);
  
  if (flowMatch) {
     const flowFn = flowMatch[1];
     
     // Inject the dynamic __clipboardFlow variable
     code = code.replace(
       `window.figma.captureForDesign=${prName},`, 
       `window.figma.captureForDesign=${prName},window.figma.__clipboardFlow=${flowFn},`
     );
     
     fs.writeFileSync('capture.js', code);
     console.log('Patched __clipboardFlow with dynamically extracted function: ' + flowFn);
  } else {
     console.error('Could not find flow function. Figma might have changed their build output again.');
     process.exit(1);
  }
} else {
  console.error('Could not find captureForDesign. Figma might have changed their build output again.');
  process.exit(1);
}
