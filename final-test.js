#!/usr/bin/env node

/**
 * Final Verification Script for Glitch Redesign
 * Tests all requirements from task 15
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🎮 GLITCH REDESIGN - FINAL VERIFICATION\n');
console.log('═'.repeat(60));

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(test) {
  results.passed.push(test);
  console.log(`✅ ${test}`);
}

function fail(test, reason) {
  results.failed.push({ test, reason });
  console.log(`❌ ${test}`);
  if (reason) console.log(`   Reason: ${reason}`);
}

function warn(test, reason) {
  results.warnings.push({ test, reason });
  console.log(`⚠️  ${test}`);
  if (reason) console.log(`   Reason: ${reason}`);
}

// 1. Check for unused CSS classes
console.log('\n📋 1. Checking for unused CSS classes...');
const globalCSS = fs.readFileSync('src/styles/global.css', 'utf8');

// Check for old hacker-style classes
const oldClasses = [
  'terminal-',
  'hacker-',
  'matrix-',
  'wave-',
  'rainbow',
  'hue-rotate',
  'ascii-art'
];

let foundOldClasses = false;
oldClasses.forEach(oldClass => {
  if (globalCSS.includes(oldClass)) {
    fail(`Found old class: ${oldClass}`, 'Should be removed');
    foundOldClasses = true;
  }
});

if (!foundOldClasses) {
  pass('No old hacker-style classes found');
}

// 2. Check for unused JavaScript files
console.log('\n📋 2. Checking for unused JavaScript files...');
const scriptsDir = 'src/scripts';
if (fs.existsSync(scriptsDir)) {
  const files = fs.readdirSync(scriptsDir);
  
  // Only performance-monitor.js should exist
  const expectedFiles = ['performance-monitor.js'];
  const unexpectedFiles = files.filter(f => !expectedFiles.includes(f));
  
  if (unexpectedFiles.length > 0) {
    warn('Unexpected files in scripts directory', unexpectedFiles.join(', '));
  } else {
    pass('Only expected script files present');
  }
} else {
  warn('Scripts directory not found');
}

// 3. Check that old effects are removed
console.log('\n📋 3. Checking that old effects are removed...');
const oldEffects = [
  'blur(',
  'drop-shadow(',
  'hue-rotate(',
  'rainbow',
  'terminal-green'
];

let foundOldEffects = false;
oldEffects.forEach(effect => {
  // Skip if it's in a comment
  const lines = globalCSS.split('\n');
  lines.forEach((line, i) => {
    if (line.includes(effect) && !line.trim().startsWith('/*') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      fail(`Found old effect: ${effect} on line ${i + 1}`, 'Should be removed');
      foundOldEffects = true;
    }
  });
});

if (!foundOldEffects) {
  pass('No old effects found');
}

// 4. Check glitch periodicity (3-10 sec)
console.log('\n📋 4. Checking glitch periodicity...');
const baseLayout = fs.readFileSync('src/layouts/BaseLayout.astro', 'utf8');

if (baseLayout.includes('Math.random() * 7000 + 3000')) {
  pass('Glitch periodicity: 3-10 seconds ✓');
} else {
  fail('Glitch periodicity not configured correctly', 'Should be 3-10 seconds');
}

// 5. Check canvas artifacts implementation
console.log('\n📋 5. Checking canvas artifacts...');
const requiredArtifacts = [
  'generatePixelShift',
  'generateChannelShift',
  'generateBlockCorruption',
  'generateScanlines',
  'generateNoise'
];

let allArtifactsPresent = true;
requiredArtifacts.forEach(artifact => {
  if (baseLayout.includes(artifact)) {
    pass(`Canvas artifact: ${artifact} ✓`);
  } else {
    fail(`Canvas artifact: ${artifact}`, 'Not found in BaseLayout');
    allArtifactsPresent = false;
  }
});

// 6. Check instant navigation
console.log('\n📋 6. Checking instant navigation...');
if (baseLayout.includes('ViewTransitions')) {
  pass('ViewTransitions enabled for instant navigation');
} else {
  fail('ViewTransitions not found', 'Required for instant navigation');
}

// 7. Check text-only minimalism
console.log('\n📋 7. Checking text-only minimalism...');
const components = [
  'src/components/Navigation.astro',
  'src/components/ProfileCard.astro'
];

let hasComplexStyles = false;
components.forEach(comp => {
  const content = fs.readFileSync(comp, 'utf8');
  
  // Check for complex styles that shouldn't be there
  if (content.includes('gradient') || content.includes('box-shadow') || content.includes('text-shadow')) {
    fail(`${comp} has complex styles`, 'Should be text-only minimalist');
    hasComplexStyles = true;
  }
});

if (!hasComplexStyles) {
  pass('Components follow text-only minimalism');
}

// 8. Check pixel font
console.log('\n📋 8. Checking pixel font...');
if (globalCSS.includes('VT323') || globalCSS.includes('Press Start 2P')) {
  pass('Pixel font configured (VT323 or Press Start 2P)');
} else {
  fail('Pixel font not found', 'Should use VT323 or Press Start 2P');
}

// 9. Check bright burned colors
console.log('\n📋 9. Checking bright burned colors...');
const requiredColors = [
  '--magenta: #ff00ff',
  '--cyan: #00ffff',
  '--lime: #ccff00',
  '--pink: #ff0088',
  '--purple: #8800ff',
  '--green: #00ff00'
];

let allColorsPresent = true;
requiredColors.forEach(color => {
  if (globalCSS.includes(color)) {
    pass(`Color defined: ${color.split(':')[0]} ✓`);
  } else {
    fail(`Color not found: ${color}`, 'Required for breakcore aesthetic');
    allColorsPresent = false;
  }
});

// 10. Check encoding errors on background
console.log('\n📋 10. Checking encoding errors on background...');
if (globalCSS.includes('����') && globalCSS.includes('日本語') && globalCSS.includes('中文')) {
  pass('Background encoding errors present');
} else {
  fail('Background encoding errors not found', 'Required for glitch aesthetic');
}

// 11. Check unique page accents
console.log('\n📋 11. Checking unique page accents...');
const pages = [
  { file: 'src/pages/contacts.astro', accent: 'contacts' },
  { file: 'src/pages/projects.astro', accent: 'projects' },
  { file: 'src/pages/peripherals.astro', accent: 'peripherals' }
];

let allAccentsPresent = true;
pages.forEach(page => {
  const content = fs.readFileSync(page.file, 'utf8');
  if (content.includes(`currentTab="${page.accent}"`)) {
    pass(`Page accent: ${page.accent} ✓`);
  } else {
    fail(`Page accent not found: ${page.accent}`, `Should be in ${page.file}`);
    allAccentsPresent = false;
  }
});

// 12. Check TempleOS/breakcore vibe
console.log('\n📋 12. Checking TempleOS/breakcore vibe...');
const vibeChecks = [
  { check: 'Pixel font', present: globalCSS.includes('VT323') },
  { check: 'Bright colors', present: globalCSS.includes('--magenta') },
  { check: 'Encoding errors', present: globalCSS.includes('����') },
  { check: 'Canvas artifacts', present: baseLayout.includes('VRAMArtifacts') },
  { check: 'Periodic glitches', present: baseLayout.includes('scheduleNextGlitch') }
];

let vibeScore = 0;
vibeChecks.forEach(check => {
  if (check.present) {
    vibeScore++;
  }
});

if (vibeScore === vibeChecks.length) {
  pass('TempleOS/breakcore vibe: All elements present ✓');
} else {
  warn('TempleOS/breakcore vibe', `${vibeScore}/${vibeChecks.length} elements present`);
}

// 13. Check for Tailwind removal
console.log('\n📋 13. Checking for Tailwind removal...');
const pageFiles = [
  'src/pages/contacts.astro',
  'src/pages/projects.astro',
  'src/pages/peripherals.astro',
  'src/pages/index.astro'
];

let foundTailwind = false;
pageFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Check for Tailwind utility classes in class attributes
  const tailwindPattern = /class="[^"]*\b(min-h-screen|pt-\d+|items-center|justify-center|p-\d+)\b[^"]*"/g;
  
  const matches = content.match(tailwindPattern);
  if (matches) {
    matches.forEach(match => {
      fail(`Found Tailwind class in ${file}: ${match}`, 'Should use pure CSS');
      foundTailwind = true;
    });
  }
});

if (!foundTailwind) {
  pass('No Tailwind utility classes found in pages');
}

// 14. Check CSS glitch effects
console.log('\n📋 14. Checking CSS glitch effects...');
const cssEffects = [
  'channel-shift',
  'pixel-shift',
  'block-corrupt',
  'scanlines',
  'text-corrupt'
];

let allEffectsPresent = true;
cssEffects.forEach(effect => {
  if (globalCSS.includes(`.${effect}`) || globalCSS.includes(`@keyframes ${effect}`)) {
    pass(`CSS effect: ${effect} ✓`);
  } else {
    fail(`CSS effect not found: ${effect}`, 'Required for glitch aesthetic');
    allEffectsPresent = false;
  }
});

// 15. Check accessibility features
console.log('\n📋 15. Checking accessibility features...');
if (globalCSS.includes('prefers-reduced-motion')) {
  pass('Reduced motion support present');
} else {
  fail('Reduced motion support not found', 'Required for accessibility');
}

if (globalCSS.includes('focus-visible')) {
  pass('Focus-visible styles present');
} else {
  warn('Focus-visible styles not found', 'Recommended for accessibility');
}

// Print summary
console.log('\n' + '═'.repeat(60));
console.log('\n📊 FINAL SUMMARY\n');
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);

if (results.failed.length > 0) {
  console.log('\n❌ Failed tests:');
  results.failed.forEach(({ test, reason }) => {
    console.log(`   - ${test}`);
    if (reason) console.log(`     ${reason}`);
  });
}

if (results.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  results.warnings.forEach(({ test, reason }) => {
    console.log(`   - ${test}`);
    if (reason) console.log(`     ${reason}`);
  });
}

console.log('\n' + '═'.repeat(60));

if (results.failed.length === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Ready for deployment.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review and fix.\n');
  process.exit(1);
}
