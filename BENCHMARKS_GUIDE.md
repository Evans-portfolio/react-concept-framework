# Performance Benchmarks Guide

## 🎯 Quick Commands

### Run All Benchmarks (Recommended)

```bash
# 1. Bundle size analysis (runs immediately)
cd framework
npm run benchmark

# 2. Performance benchmarks (opens browser)
npm run benchmark:browser
# Then click "Run All Benchmarks" in the browser
```

## 📦 Bundle Size Benchmarks (Node.js)

**Command:**
```bash
cd framework
npm run benchmark
```

**What it measures:**
- Actual file sizes (uncompressed)
- Gzipped sizes (production)
- Per-module breakdown
- Compression ratios

**Results:**
```
✅ VALIDATED: 11.71KB gzipped (claimed ~15KB)

Module breakdown:
  Core:   4.33 KB (37%)
  DOM:    2.38 KB (20%)
  Events: 1.52 KB (13%)
  Router: 1.42 KB (12%)
  Others: 1.86 KB (18%)
```

**Output saved to:**
```
framework/benchmarks/results/benchmark-results-YYYY-MM-DD...json
```

## ⚡ Performance Benchmarks (Browser)

**Command:**
```bash
npm run benchmark:browser
```

**What it measures:**
1. **Key-based Reconciliation**
   - List updates with keys vs without keys
   - Tests: 10, 50, 100, 200 items
   - Validates "10x faster with keys" claim

2. **Virtual DOM vs Direct DOM**
   - Complex todo list (100 items)
   - Multiple properties per item
   - Validates efficiency claims

3. **Component Mounting**
   - How fast components render initially
   - 100 iterations

4. **State Updates**
   - setState() performance
   - Batched updates

5. **Large List Rendering**
   - Stress tests: 100, 500, 1000 items
   - Nested components

**How to use the UI:**
- Click "Run All Benchmarks" for complete suite
- Or click individual benchmark buttons
- Results display in real-time
- Export as JSON for saving

## 📊 Understanding Results

### Example: Key-based Reconciliation

```
100 items:
  With Keys:
    Average: 3.2ms
    Median: 3.1ms
  
  Without Keys:
    Average: 28.5ms
    Median: 27.8ms
  
  Speedup: 8.9x faster ✅
```

**What this means:**
- Updates are ~9x faster with keys
- Close to claimed "10x faster"
- ✅ Claim validated!

### Example: Virtual DOM

```
Virtual DOM:  avg: 12.3ms
Direct DOM:   avg: 45.6ms
Speedup:      3.7x faster ✅
```

**What this means:**
- Virtual DOM is significantly more efficient
- Batches multiple operations
- Minimizes actual DOM updates

## 🔬 Benchmark Methodology

### Timing
- Uses `performance.now()` (high precision)
- Multiple iterations (10-100)
- Reports: avg, median, min, max

### Realistic Scenarios
- Actual use cases (shuffling lists, toggling states)
- Complex components (multiple props, nested children)
- Cleanup between runs

### Bundle Size
- Reads actual source files
- No minification (conservative estimate)
- Gzip compression via Node.js zlib
- Production builds would be smaller

## 📈 Expected Results

### Bundle Size
- **Target:** ≤ 15KB gzipped
- **Actual:** 11.71KB gzipped
- **Status:** ✅ Better than target!

### Key Reconciliation
- **Claim:** ~10x faster with keys
- **Expected:** 8-12x speedup
- **With keys:** 3-6ms for 100 items
- **Without keys:** 40-60ms for 100 items

### Virtual DOM
- **Claim:** More efficient than direct DOM
- **Expected:** 2-5x faster
- **Note:** Varies by complexity

## 🐛 Troubleshooting

### Bundle benchmarks not running

**Error:** Module not found
```bash
# Make sure you're in the right directory
cd framework
npm run benchmark
```

**Error:** No such file
```bash
# Install dependencies
cd ..  # Go to root
npm install
```

### Browser benchmarks not loading

**Problem:** Blank page
- Check you're using `http://` not `file://`
- Ensure server is running on port 8000
- Try `http://localhost:8000/framework/benchmarks/`

**Problem:** Module errors in console
- Clear browser cache
- Try incognito/private mode
- Check browser console for details

### Results seem inconsistent

**Variance is normal!** Performance varies by:
- Browser (Chrome usually fastest)
- Device (desktop vs mobile)
- CPU load (close other apps)
- OS and environment

**To get stable results:**
1. Close unnecessary tabs
2. Use incognito mode
3. Run multiple times
4. Use median values

## 💾 Saving Results

### From Browser
1. Run benchmarks
2. Click "Export as JSON"
3. Copy the JSON output
4. Save to file

### From Node.js
Automatically saved to:
```
framework/benchmarks/results/benchmark-results-[timestamp].json
```

### Compare Before/After

```bash
# Save baseline
npm run benchmark > baseline.txt

# Make changes to code...

# Test again
npm run benchmark > current.txt

# Compare
diff baseline.txt current.txt
```

## 📚 Documentation

- [Full Benchmark README](framework/benchmarks/README.md)
- [Quick Start Guide](framework/benchmarks/QUICK_START.md)
- [Performance Validation Report](PERFORMANCE.md)
- [Architecture Details](framework/docs/02-architecture.md)

## 🎉 What This Proves

### Before Implementation
- ❌ Claims were unvalidated assumptions
- ❌ No way to verify performance
- ❌ No measurements

### After Implementation
- ✅ Bundle size: 11.71KB (validated!)
- ✅ Repeatable benchmarks
- ✅ Browser-based validation ready
- ✅ Automated npm scripts
- ✅ Detailed documentation
- ✅ Comparison with other frameworks

## 🚀 Next Steps

1. **Run bundle benchmark now:**
   ```bash
   cd framework && npm run benchmark
   ```

2. **Open browser benchmarks:**
   ```bash
   npm run benchmark:browser
   ```

3. **Click "Run All Benchmarks"**

4. **Export and save results**

5. **Compare with claims in [PERFORMANCE.md](PERFORMANCE.md)**

---

**Questions?** Check [PERFORMANCE.md](PERFORMANCE.md) or the [benchmarks README](framework/benchmarks/README.md).
