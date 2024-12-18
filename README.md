# FileForge 🛠️

A powerful, browser-based file manipulation tool built with modern web technologies. FileForge allows users to perform various file operations directly in their browser without requiring server uploads.

## Features 🌟

### 1. Format Converter
- Convert between various file formats:
  - PDF to JPG/PNG
  - Images (JPG/PNG) to PDF
  - Text to PDF
- Batch conversion support
- Preview before conversion

### 2. File Compressor
- Compress multiple file types:
  - Images (JPG, PNG)
  - PDFs
- Adjustable compression levels (1-9)
- Size reduction preview
- Maintains reasonable quality
- Batch compression support

### 3. PDF Merger
- Combine multiple PDF files into one
- Drag-and-drop file ordering
- Preview before merging
- Maintains original PDF quality
- Supports large files

### 4. File Splitter
- Split PDF files into multiple parts
- Custom split points
- Preview split sections
- Maintains original quality
- Batch downloading of split files

### Core Features ⚙️
- Modern, responsive UI
- Drag-and-drop support
- Progress tracking
- Offline support (PWA)
- No server uploads required
- Cross-browser compatibility
- Mobile-friendly design

## Technical Stack 💻

- HTML5
- CSS3
- JavaScript (ES6+)
- Libraries:
  - PDF-lib.js (PDF manipulation)
  - FileSaver.js (File downloading)
  - Font Awesome (Icons)

## Running the Project Locally 🚀

### Prerequisites
1. Install Visual Studio Code
2. Install the "Live Server" extension for VS Code
   - Open VS Code
   - Click Extensions icon (or press Ctrl+Shift+X)
   - Search for "Live Server"
   - Install the extension by Ritwick Dey

### Setup Steps

1. Clone or download the project:
```bash
git clone https://github.com/cdrcknt/fileforge.git
```

2. Create the project structure:
```
fileforge/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── fileOperations.js
│   └── ui.js
├── assets/
│   ├── favicon.ico
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── manifest.json
└── service-worker.js
```

3. Open in VS Code:
```bash
cd fileforge
code .
```

4. Launch with Live Server:
   - Right-click `index.html`
   - Select "Open with Live Server"
   - Your default browser will open with the app running

### Development Tips 🔧

1. **Browser Console:**
   - Press F12 to open Developer Tools
   - Check Console for errors/logs
   - Use Network tab to monitor file operations

2. **Testing Files:**
   - Keep sample PDFs and images in your project folder
   - Test with various file sizes
   - Test with different file formats

3. **PWA Development:**
   - Use Chrome's Lighthouse to audit PWA features
   - Test offline functionality
   - Verify service worker registration

## Production Deployment 🌐

1. Build Requirements:
   - HTTPS enabled domain
   - Web hosting service
   - All files minified (optional but recommended)

2. Deployment Steps:
   ```bash
   # 1. Minify JavaScript files
   # Using terser (install via npm)
   npm install -g terser
   terser js/main.js -o js/main.min.js
   terser js/fileOperations.js -o js/fileOperations.min.js
   terser js/ui.js -o js/ui.min.js

   # 2. Minify CSS
   # Using clean-css-cli (install via npm)
   npm install -g clean-css-cli
   cleancss -o css/styles.min.css css/styles.css
   ```

3. Update index.html to use minified files
4. Upload to your web hosting service

## Troubleshooting 🔍

### Common Issues:

1. **Files Not Loading:**
   - Check browser console for errors
   - Verify file paths in index.html
   - Ensure Live Server is running

2. **Service Worker Issues:**
   - Must be served over HTTPS (except localhost)
   - Clear browser cache
   - Check service worker registration in console

3. **PDF Operations Failing:**
   - Verify PDF-lib.js is properly loaded
   - Check PDF file isn't corrupted
   - Monitor console for specific errors

### Solutions:

1. **Dev Environment:**
   ```bash
   # Clear service worker
   # In Chrome DevTools Console:
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
       for(let registration of registrations) {
           registration.unregister();
       }
   });
   ```

2. **Cache Issues:**
   ```bash
   # In Chrome DevTools Console:
   caches.keys().then(keys => {
       keys.forEach(key => caches.delete(key));
   });
   ```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

### Developers
Cedric Kent Centeno

```
fileforge
├─ assets
│  ├─ android-icon-144x144.png
│  ├─ android-icon-192x192.png
│  ├─ android-icon-36x36.png
│  ├─ android-icon-48x48.png
│  ├─ android-icon-72x72.png
│  ├─ android-icon-96x96.png
│  ├─ apple-icon-114x114.png
│  ├─ apple-icon-120x120.png
│  ├─ apple-icon-144x144.png
│  ├─ apple-icon-152x152.png
│  ├─ apple-icon-180x180.png
│  ├─ apple-icon-57x57.png
│  ├─ apple-icon-60x60.png
│  ├─ apple-icon-72x72.png
│  ├─ apple-icon-76x76.png
│  ├─ apple-icon-precomposed.png
│  ├─ apple-icon.png
│  ├─ favicon-16x16.png
│  ├─ favicon-32x32.png
│  ├─ favicon-96x96.png
│  ├─ ms-icon-144x144.png
│  ├─ ms-icon-150x150.png
│  ├─ ms-icon-310x310.png
│  └─ ms-icon-70x70.png
├─ css
│  └─ styles.css
├─ index.html
├─ js
│  ├─ fileOperations.js
│  ├─ main.js
│  └─ ui.js
├─ manifest.json
├─ README.md
└─ service-worker.js

```