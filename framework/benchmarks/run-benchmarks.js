#!/usr/bin/env node

/**
 * Benchmark Runner Script
 * Run performance benchmarks from command line
 */

import { runBundleSizeBenchmarks } from './bundle-size.bench.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     Framework Performance Benchmark Suite                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// Run bundle size benchmarks
console.log('═══════════════════════════════════════════════════════════');
console.log('  BUNDLE SIZE BENCHMARKS');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

const bundleResults = runBundleSizeBenchmarks();

// Save results to file
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const resultsFile = path.join(resultsDir, `benchmark-results-${timestamp}.json`);

const fullResults = {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  bundleSizes: bundleResults
};

fs.writeFileSync(resultsFile, JSON.stringify(fullResults, null, 2));

console.log(`\n📝 Results saved to: ${resultsFile}`);

// Generate summary report
console.log('\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('  PERFORMANCE SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

const totalFramework = bundleResults.moduleSizes['Total Framework'];
console.log('📦 Total Framework Size:');
console.log(`   Uncompressed: ${totalFramework.totalSizeFormatted}`);
console.log(`   Gzipped: ${totalFramework.gzippedSizeFormatted}`);
console.log(`   Compression Ratio: ${totalFramework.compressionRatio}x`);
console.log('');

// Validate claims
console.log('✅ Claim Validation:');
console.log('');

const gzippedKB = totalFramework.gzippedSize / 1024;
const claimedSize = 15; // KB

if (gzippedKB <= claimedSize) {
  console.log(`   ✅ Bundle size claim VALIDATED`);
  console.log(`      Claimed: ~${claimedSize}KB gzipped`);
  console.log(`      Actual: ${gzippedKB.toFixed(2)}KB gzipped`);
} else {
  console.log(`   ⚠️  Bundle size claim NOT MET`);
  console.log(`      Claimed: ~${claimedSize}KB gzipped`);
  console.log(`      Actual: ${gzippedKB.toFixed(2)}KB gzipped`);
  console.log(`      Difference: +${(gzippedKB - claimedSize).toFixed(2)}KB`);
}

console.log('');
console.log('📊 Module Breakdown:');
Object.entries(bundleResults.moduleSizes).forEach(([name, data]) => {
  if (name !== 'Total Framework') {
    const percentage = ((data.gzippedSize / totalFramework.gzippedSize) * 100).toFixed(1);
    console.log(`   ${name.padEnd(15)} ${data.gzippedSizeFormatted.padEnd(10)} (${percentage}%)`);
  }
});

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  NEXT STEPS');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('To run DOM performance benchmarks (requires browser):');
console.log('');
console.log('  1. Start a local server:');
console.log('     python3 -m http.server 8000');
console.log('');
console.log('  2. Open in browser:');
console.log('     http://localhost:8000/framework/benchmarks/');
console.log('');
console.log('  3. Click "Run All Benchmarks" to see performance results');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
