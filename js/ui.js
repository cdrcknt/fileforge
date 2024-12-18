class UI {
    constructor() {
        this.toolsContainer = document.querySelector('.tools-container');
        this.workspace = document.querySelector('.workspace');
        this.dropZone = document.querySelector('.drop-zone');
        this.fileInput = document.querySelector('.file-input');
        this.optionsPanel = document.querySelector('.options-panel');
        this.resultsPanel = document.querySelector('.results-panel');
        this.toolTitle = document.querySelector('.tool-title');
        this.backBtn = document.querySelector('.back-btn');
        this.processBtn = document.querySelector('#processBtn');
        this.downloadAllBtn = document.querySelector('#downloadAllBtn');
        
        this.currentTool = null;
        this.files = [];
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Tool selection
        this.toolsContainer.addEventListener('click', (e) => {
            const toolCard = e.target.closest('.tool-card');
            if (toolCard) {
                this.selectTool(toolCard.dataset.tool);
            }
        });

        // Back button
        this.backBtn.addEventListener('click', () => this.showTools());

        // File handling
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        // Process button
        this.processBtn.addEventListener('click', () => this.processFiles());

        // Download all button
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
    }

    selectTool(toolName) {
        this.currentTool = toolName;
        this.toolTitle.textContent = this.getToolTitle(toolName);
        this.toolsContainer.classList.add('hidden');
        this.workspace.classList.remove('hidden');
        this.configureToolOptions(toolName);
    }

    getToolTitle(toolName) {
        const titles = {
            converter: 'Format Converter',
            compress: 'File Compressor',
            merge: 'PDF Merger',
            split: 'File Splitter'
        };
        return titles[toolName] || 'Tool';
    }

    configureToolOptions(toolName) {
        const formatOptions = document.querySelector('.format-options');
        const compressionOptions = document.querySelector('.compression-options');
        
        formatOptions.classList.add('hidden');
        compressionOptions.classList.add('hidden');
        
        switch (toolName) {
            case 'converter':
                formatOptions.classList.remove('hidden');
                break;
            case 'compress':
                compressionOptions.classList.remove('hidden');
                break;
        }
    }

    showTools() {
        this.toolsContainer.classList.remove('hidden');
        this.workspace.classList.add('hidden');
        this.optionsPanel.classList.add('hidden');
        this.resultsPanel.classList.add('hidden');
        this.clearFiles();
    }

    handleFiles(fileList) {
        this.files = Array.from(fileList);
        this.updateFileList();
        this.optionsPanel.classList.remove('hidden');
        this.resultsPanel.classList.add('hidden');
    }

    updateFileList() {
        const fileListEl = document.createElement('div');
        fileListEl.className = 'file-list';
        
        this.files.forEach((file, index) => {
            const fileEl = document.createElement('div');
            fileEl.className = 'file-item';
            fileEl.innerHTML = `
                <span>${file.name}</span>
                <button class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileListEl.appendChild(fileEl);
        });

        const existingFileList = this.dropZone.querySelector('.file-list');
        if (existingFileList) {
            existingFileList.remove();
        }
        
        this.dropZone.appendChild(fileListEl);
    }

    clearFiles() {
        this.files = [];
        this.updateFileList();
        this.fileInput.value = '';
    }

    async processFiles() {
        try {
            this.processBtn.disabled = true;
            this.processBtn.textContent = 'Processing...';

            const operations = new FileOperations();
            const options = this.getProcessingOptions();
            
            const results = await operations.processFiles(this.files, this.currentTool, options);
            this.showResults(results);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.processBtn.disabled = false;
            this.processBtn.textContent = 'Process Files';
        }
    }

    getProcessingOptions() {
        const options = {};
        
        switch (this.currentTool) {
            case 'converter':
                options.format = document.querySelector('#formatSelect').value;
                break;
            case 'compress':
                options.level = parseInt(document.querySelector('#compressionLevel').value);
                break;
            case 'split':
                options.parts = 2; // Default to 2 parts, could be made configurable
                break;
        }
        
        return options;
    }

    showResults(results) {
        const resultsList = document.querySelector('.results-list');
        resultsList.innerHTML = '';
        
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = `result-item ${result.success ? 'success' : 'error'}`;
            
            if (result.success) {
                resultItem.innerHTML = `
                    <div class="result-info">
                        <span class="result-name">${result.name}</span>
                        ${result.originalSize ? `
                            <span class="size-info">
                                ${this.formatSize(result.originalSize)} → ${this.formatSize(result.newSize)}
                            </span>
                        ` : ''}
                    </div>
                    <button class="download-btn" data-blob="${result.data}">
                        <i class="fas fa-download"></i>
                    </button>
                `;
                
                const downloadBtn = resultItem.querySelector('.download-btn');
                downloadBtn.addEventListener('click', () => {
                    this.downloadFile(result.data, result.name);
                });
            } else {
                resultItem.innerHTML = `
                    <div class="result-info error">
                        <span class="result-name">${result.name}</span>
                        <span class="error-message">${result.error}</span>
                    </div>
                `;
            }
            
            resultsList.appendChild(resultItem);
        });

        this.resultsPanel.classList.remove('hidden');
        this.downloadAllBtn.style.display = results.some(r => r.success) ? 'block' : 'none';
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    downloadAll() {
        const successfulResults = Array.from(document.querySelectorAll('.result-item.success'));
        successfulResults.forEach(result => {
            result.querySelector('.download-btn').click();
        });
    }

    formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        let size = bytes;
        
        while (size >= 1024 && i < sizes.length - 1) {
            size /= 1024;
            i++;
        }
        
        return `${size.toFixed(1)} ${sizes[i]}`;
    }

    showError(message) {
        // Implementation of error display (could be enhanced with a toast notification system)
        alert(message);
    }
}

// Export the class
window.UI = UI;