# Quick Start: Running Benchmarks

## 🚀 TL;DR

```bash
# Bundle size benchmarks (Node.js - works now)
cd framework
npm run benchmark

# Performance benchmarks (Browser - requires web server)
npm run benchmark:browser
# Then open http://localhost:8000/framework/benchmarks/
```

## 📦 What Gets Benchmarked

### 1. Bundle Size (✅ Already Run!)
- **Result:** 11.71KB gzipped (better than 15KB claim!)
- Measures actual framework size
- No minification (production would be smaller)

### 2. Key-Based Reconciliation (Browser Required)
- Compares list updates with/without keys
- Tests 10, 50, 100, 200 item lists
- Validates "10x faster" claim

### 3. Virtual DOM vs Direct DOM (Browser Required)
- Complex todo list updates
- Compares framework vs native DOM

### 4. Other Metrics (Browser Required)
- Component mounting speed
- State update performance
- Large list rendering (stress test)

## 🎯 Expected Results

### Bundle Size: ✅ VALIDATED
- **Claimed:** ~15KB gzipped
- **Actual:** 11.71KB gzipped
- **Status:** Better than claimed!

### Key Reconciliation: 🔄 Browser Test Required
- **Claimed:** ~10x faster with keys
- **Expected:** 8-12x speedup for 100 items
- **With keys:** ~3-6ms
- **Without keys:** ~40-60ms

### Virtual DOM: 🔄 Browser Test Required
- **Claimed:** More efficient than direct DOM
- **Expected:** 2-5x faster for complex updates

## 🌐 Browser Benchmarks

1. **Start server:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Open browser:**
   ```
   http://localhost:8000/framework/benchmarks/
   ```

3. **Run tests:**
   - Click "Run All Benchmarks" for complete suite
   - Or run individual benchmarks
   - Export results as JSON

4. **Interpret results:**
   - Green badges (✅) = Claim validated
   - Red badges (⚠️) = Below expected
   - Compare your results with expected values

## 📊 Understanding the Results

### Good Results
```
100 items:
  With Keys:    avg: 3.2ms  ✅
  Without Keys: avg: 28.5ms ✅
  Speedup: 8.9x faster      ✅
```

### What if results are different?
- Performance varies by browser and device
- Chrome is usually fastest
- Mobile devices are slower
- Close other tabs for accurate results

## 📝 Save Your Results

### From Browser
1. Run benchmarks
2. Click "Export as JSON"
3. Copy and save the output

### From Node.js
Results auto-saved to:
```
framework/benchmarks/results/benchmark-results-YYYY-MM-DD...json
```

## 🔄 Compare Before/After Changes

```bash
# Before changes
npm run benchmark > baseline.txt

# Make code changes...

# After changes
npm run benchmark > current.txt

# Compare
diff baseline.txt current.txt
```

## ❓ Troubleshooting

### "Module not found" error
- Make sure you're in the `framework/` directory
- Run `npm install` in root directory

### Browser benchmarks not loading
- Use `http://` not `file://`
- Check browser console for errors
- Ensure server is running on port 8000

### Results seem slow
- Close other applications
- Use incognito/private mode
- Try different browser
- Desktop performs better than mobile

## 📚 More Information

- [Full Benchmark Documentation](README.md)
- [Performance Validation Report](../../PERFORMANCE.md)
- [Architecture Details](../docs/02-architecture.md)

---

**Need help?** Check the full [Benchmark README](README.md) or [open an issue](https://github.com/yourrepo/issues).
