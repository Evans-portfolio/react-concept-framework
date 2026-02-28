/**
 * Bundle Size Benchmarks
 * Measures the actual bundle sizes of framework modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {number} Size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Get gzipped size of file content
 * @param {string} content - File content
 * @returns {number} Gzipped size in bytes
 */
function getGzippedSize(content) {
  return zlib.gzipSync(content).length;
}

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate sizes for a module
 * @param {string} modulePath - Path to module directory or file
 * @returns {Object} Size information
 */
function calculateModuleSize(modulePath) {
  const fullPath = path.resolve(__dirname, '..', modulePath);

  let totalSize = 0;
  let files = [];

  function walkDirectory(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        walkDirectory(itemPath);
      } else if (item.endsWith('.js')) {
        const size = getFileSize(itemPath);
        totalSize += size;
        files.push({
          name: path.relative(fullPath, itemPath),
          size,
          sizeFormatted: formatBytes(size)
        });
      }
    });
  }

  if (fs.statSync(fullPath).isDirectory()) {
    walkDirectory(fullPath);
  } else {
    const size = getFileSize(fullPath);
    totalSize = size;
    files.push({
      name: path.basename(fullPath),
      size,
      sizeFormatted: formatBytes(size)
    });
  }

  // Calculate combined content for gzip
  let combinedContent = '';
  files.forEach(file => {
    const filePath = path.join(fullPath, file.name);
    try {
      combinedContent += fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      // File might be in different location
    }
  });

  const gzippedSize = getGzippedSize(combinedContent);

  return {
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    gzippedSize,
    gzippedSizeFormatted: formatBytes(gzippedSize),
    files,
    compressionRatio: Number((totalSize / gzippedSize).toFixed(2))
  };
}

/**
 * Benchmark all framework modules
 */
export function benchmarkBundleSizes() {
  const modules = {
    'Core': 'src/core',
    'DOM': 'src/dom',
    'State': 'src/state',
    'Router': 'src/router',
    'HTTP': 'src/http',
    'Events': 'src/events',
    'Utils': 'src/utils'
  };

  const results = {};
  let totalUncompressed = 0;
  let totalGzipped = 0;

  Object.entries(modules).forEach(([name, modulePath]) => {
    const moduleSize = calculateModuleSize(modulePath);
    results[name] = moduleSize;
    totalUncompressed += moduleSize.totalSize;
    totalGzipped += moduleSize.gzippedSize;
  });

  results['Total Framework'] = {
    totalSize: totalUncompressed,
    totalSizeFormatted: formatBytes(totalUncompressed),
    gzippedSize: totalGzipped,
    gzippedSizeFormatted: formatBytes(totalGzipped),
    compressionRatio: Number((totalUncompressed / totalGzipped).toFixed(2))
  };

  return results;
}

/**
 * Compare with other frameworks (theoretical)
 */
export function compareWithOtherFrameworks(ourSize) {
  return {
    'Our Framework': {
      minified: ourSize.totalSizeFormatted,
      gzipped: ourSize.gzippedSizeFormatted
    },
    'React (production)': {
      minified: '~130 KB',
      gzipped: '~42 KB'
    },
    'Vue 3': {
      minified: '~100 KB',
      gzipped: '~34 KB'
    },
    'Preact': {
      minified: '~10 KB',
      gzipped: '~4 KB'
    },
    'Svelte (runtime)': {
      minified: '~5 KB',
      gzipped: '~2 KB'
    }
  };
}

/**
 * Run bundle size benchmarks
 */
export function runBundleSizeBenchmarks() {
  console.log('📦 Starting Bundle Size Benchmarks...\n');

  const moduleSizes = benchmarkBundleSizes();

  console.log('📊 Module Sizes:');
  Object.entries(moduleSizes).forEach(([name, data]) => {
    console.log(`\n${name}:`);
    console.log(`  Uncompressed: ${data.totalSizeFormatted}`);
    console.log(`  Gzipped: ${data.gzippedSizeFormatted}`);
    console.log(`  Compression: ${data.compressionRatio}x`);

    if (data.files && data.files.length > 0) {
      console.log(`  Files:`);
      data.files.forEach(file => {
        console.log(`    - ${file.name}: ${file.sizeFormatted}`);
      });
    }
  });

  console.log('\n\n📊 Comparison with Other Frameworks:');
  const comparison = compareWithOtherFrameworks(moduleSizes['Total Framework']);
  Object.entries(comparison).forEach(([name, sizes]) => {
    console.log(`\n${name}:`);
    console.log(`  Minified: ${sizes.minified}`);
    console.log(`  Gzipped: ${sizes.gzipped}`);
  });

  console.log('\n✅ Bundle size benchmarks completed!\n');

  return {
    moduleSizes,
    comparison
  };
}
