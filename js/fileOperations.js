class FileOperations {
    constructor() {
        this.supportedConversions = {
            'pdf': ['jpg', 'png'],
            'jpg': ['png', 'pdf'],
            'png': ['jpg', 'pdf'],
            'txt': ['pdf']
        };
    }

    async processFiles(files, operation, options) {
        switch (operation) {
            case 'converter':
                return await this.convertFiles(files, options.format);
            case 'compress':
                return await this.compressFiles(files, options.level);
            case 'merge':
                return await this.mergePDFs(files);
            case 'split':
                return await this.splitFile(files[0], options.parts);
            default:
                throw new Error('Unsupported operation');
        }
    }

    async convertFiles(files, targetFormat) {
        const results = [];
        
        for (const file of files) {
            try {
                const result = await this.convertFile(file, targetFormat);
                results.push({
                    name: `${file.name.split('.')[0]}.${targetFormat}`,
                    data: result,
                    success: true
                });
            } catch (error) {
                results.push({
                    name: file.name,
                    error: error.message,
                    success: false
                });
            }
        }
        
        return results;
    }

    async convertFile(file, targetFormat) {
        const sourceFormat = file.name.split('.').pop().toLowerCase();
        
        if (sourceFormat === targetFormat) {
            return file;
        }

        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
                try {
                    if (targetFormat === 'pdf') {
                        const pdfDoc = await PDFLib.PDFDocument.create();
                        
                        if (sourceFormat === 'txt') {
                            const page = pdfDoc.addPage();
                            const text = e.target.result;
                            page.drawText(text, {
                                x: 50,
                                y: page.getHeight() - 50,
                                size: 12
                            });
                        } else if (['jpg', 'png'].includes(sourceFormat)) {
                            const image = await this.loadImage(e.target.result);
                            const page = pdfDoc.addPage([image.width, image.height]);
                            page.drawImage(image, {
                                x: 0,
                                y: 0,
                                width: image.width,
                                height: image.height
                            });
                        }
                        
                        const pdfBytes = await pdfDoc.save();
                        resolve(new Blob([pdfBytes], { type: 'application/pdf' }));
                    } else if (['jpg', 'png'].includes(targetFormat)) {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = await this.loadImage(e.target.result);
                        
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        
                        canvas.toBlob((blob) => {
                            resolve(blob);
                        }, `image/${targetFormat}`);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('File reading failed'));
            
            if (['jpg', 'png', 'txt'].includes(sourceFormat)) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async compressFiles(files, level) {
        const results = [];
        const quality = level / 9;

        for (const file of files) {
            try {
                if (file.type.startsWith('image/')) {
                    const compressed = await this.compressImage(file, quality);
                    results.push({
                        name: `compressed_${file.name}`,
                        data: compressed,
                        success: true,
                        originalSize: file.size,
                        newSize: compressed.size
                    });
                } else if (file.type === 'application/pdf') {
                    const compressed = await this.compressPDF(file, quality);
                    results.push({
                        name: `compressed_${file.name}`,
                        data: compressed,
                        success: true,
                        originalSize: file.size,
                        newSize: compressed.size
                    });
                } else {
                    throw new Error('Unsupported file type for compression');
                }
            } catch (error) {
                results.push({
                    name: file.name,
                    error: error.message,
                    success: false
                });
            }
        }
        return results;
    }

    async compressImage(file, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const img = await this.loadImage(e.target.result);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calculate new dimensions while maintaining aspect ratio
                    let width = img.width;
                    let height = img.height;
                    const maxDimension = 2000;

                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height *= maxDimension / width;
                            width = maxDimension;
                        } else {
                            width *= maxDimension / height;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => resolve(blob),
                        file.type,
                        quality
                    );
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsDataURL(file);
        });
    }

    async compressPDF(file, quality) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // Compress images in the PDF
        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const images = await page.getImages();
            for (const image of images) {
                const imagePage = await pdfDoc.embedJpg(await image.getData());
                // Replace the image with a compressed version
                page.drawImage(imagePage, {
                    x: image.x,
                    y: image.y,
                    width: image.width,
                    height: image.height,
                    compression: {
                        quality: quality
                    }
                });
            }
        }

        const pdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false
        });

        return new Blob([pdfBytes], { type: 'application/pdf' });
    }

    async mergePDFs(files) {
        try {
            const mergedPdf = await PDFLib.PDFDocument.create();

            for (const file of files) {
                if (file.type !== 'application/pdf') {
                    throw new Error('All files must be PDFs');
                }

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            }

            const mergedPdfFile = await mergedPdf.save();
            return [{
                name: 'merged_document.pdf',
                data: new Blob([mergedPdfFile], { type: 'application/pdf' }),
                success: true
            }];
        } catch (error) {
            return [{
                name: 'merge_error',
                error: error.message,
                success: false
            }];
        }
    }

    async splitFile(file, parts) {
        if (file.type !== 'application/pdf') {
            throw new Error('Only PDF files can be split');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        const pagesPerPart = Math.ceil(pageCount / parts);
        const results = [];

        for (let i = 0; i < parts; i++) {
            const subDoc = await PDFLib.PDFDocument.create();
            const startPage = i * pagesPerPart;
            const endPage = Math.min((i + 1) * pagesPerPart, pageCount);
            
            for (let j = startPage; j < endPage; j++) {
                const [page] = await subDoc.copyPages(pdfDoc, [j]);
                subDoc.addPage(page);
            }

            const pdfBytes = await subDoc.save();
            results.push({
                name: `split_${i + 1}_${file.name}`,
                data: new Blob([pdfBytes], { type: 'application/pdf' }),
                success: true
            });
        }

        return results;
    }
}

// Export the class
window.FileOperations = FileOperations;