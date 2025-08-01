// Instagram Story functionality
let selectedTemplate = 'gradient-1';
let currentEventForStory = null;

function setupInstagramStoryModalListeners() {
    // Modal close button
    const closeBtn = document.getElementById('instagram-story-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInstagramStoryModal);
    } else {
        console.error('Close button not found');
    }
    
    // Modal backdrop click
    const modal = document.getElementById('instagram-story-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'instagram-story-modal') {
                closeInstagramStoryModal();
            }
        });
    } else {
        console.error('Instagram story modal not found');
    }
    
    // Template selection
    const templateOptions = document.querySelectorAll('.template-option');
    templateOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedTemplate = option.dataset.template;
            updateStoryCardPreview();
        });
    });
    
    // Download button
    const downloadBtn = document.getElementById('download-story-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadStoryImage);
    } else {
        console.error('Download button not found');
    }
    
    // Open Instagram button
    const instagramBtn = document.getElementById('open-instagram-btn');
    if (instagramBtn) {
        instagramBtn.addEventListener('click', openInstagramApp);
    } else {
        console.error('Instagram button not found');
    }
}

function openInstagramStoryModal() {
    const modal = document.getElementById('event-detail-modal');
    const eventId = modal?.dataset.eventId;
    
    if (!eventId) {
        console.error('No event ID found in modal');
        return;
    }
    
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) {
        console.error('Event not found:', eventId);
        return;
    }
    
    currentEventForStory = event;
    const storyModal = document.getElementById('instagram-story-modal');
    
    if (!storyModal) {
        console.error('Instagram story modal not found');
        return;
    }
    
    updateStoryCardPreview();
    storyModal.classList.add('visible');
    
    // Add body overflow hidden to prevent scrolling
    document.body.style.overflow = 'hidden';
}

function closeInstagramStoryModal() {
    const modal = document.getElementById('instagram-story-modal');
    if (modal) {
        modal.classList.remove('visible');
        // Restore body overflow
        document.body.style.overflow = '';
    }
}

function updateStoryCardPreview() {
    if (!currentEventForStory) {
        console.error('No current event for story');
        return;
    }
    
    const preview = document.getElementById('story-card-preview');
    if (!preview) {
        console.error('Story card preview element not found');
        return;
    }
    
    const gradients = {
        'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    
    preview.style.background = gradients[selectedTemplate] || gradients['gradient-1'];
    
    // Update content
    const eventDate = new Date(currentEventForStory.isoDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const dateElement = document.getElementById('story-card-date');
    const titleElement = document.getElementById('story-card-title');
    const categoryElement = document.getElementById('story-card-category');
    const venueElement = document.getElementById('story-card-venue');
    const timeElement = document.getElementById('story-card-time');
    
    if (dateElement) dateElement.textContent = formattedDate;
    if (titleElement) titleElement.textContent = currentEventForStory.eventName || 'Event';
    if (categoryElement) categoryElement.textContent = currentEventForStory.category || 'Event';
    if (venueElement) venueElement.textContent = `📍 ${currentEventForStory.locationName || 'Ohrid'}`;
    if (timeElement) timeElement.textContent = `🕐 ${currentEventForStory.startTime || '20:00'}`;
    
    // Update image
    const storyImage = document.getElementById('story-card-image');
    if (storyImage) {
        if (currentEventForStory.imageUrl) {
            storyImage.src = currentEventForStory.imageUrl;
            storyImage.style.display = 'block';
        } else {
            storyImage.style.display = 'none';
        }
    }
}

function downloadStoryImage() {
    if (!currentEventForStory) {
        console.error('No current event for story download');
        return;
    }
    
    // Create a high-resolution temporary preview element
    const tempPreview = createHighResolutionPreview();
    
    // Use html2canvas to capture the high-resolution preview
    if (typeof html2canvas !== 'undefined') {
        html2canvas(tempPreview, {
            width: 1080,
            height: 1920,
            scale: 1, // No scaling needed as we're already at target resolution
            backgroundColor: null,
            logging: false,
            allowTaint: true,
            useCORS: true
        }).then(canvas => {
            // Clean up the temporary element
            document.body.removeChild(tempPreview);
            downloadCanvas(canvas);
        }).catch(error => {
            console.error('html2canvas failed, falling back to manual drawing:', error);
            document.body.removeChild(tempPreview);
            downloadStoryImageManual();
        });
    } else {
        document.body.removeChild(tempPreview);
        downloadStoryImageManual();
    }
}

function createHighResolutionPreview() {
    const tempPreview = document.createElement('div');
    tempPreview.className = 'story-card-preview';
    tempPreview.id = 'temp-story-card-preview';
    
    // Set to Instagram Story resolution
    tempPreview.style.width = '1080px';
    tempPreview.style.height = '1920px';
    tempPreview.style.position = 'absolute';
    tempPreview.style.left = '-9999px'; // Hide off-screen
    tempPreview.style.top = '-9999px';
    
    // Apply the same gradient background
    const gradients = {
        'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    
    tempPreview.style.background = gradients[selectedTemplate] || gradients['gradient-1'];
    tempPreview.style.borderRadius = '2rem';
    tempPreview.style.overflow = 'hidden';
    
    // Create content structure with proper sizing for high resolution
    const content = document.createElement('div');
    content.className = 'story-card-content';
    content.style.width = '100%';
    content.style.height = '100%';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.justifyContent = 'space-between';
    content.style.padding = '120px 80px';
    content.style.color = 'white';
    content.style.textAlign = 'center';
    content.style.position = 'relative';
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'linear-gradient(45deg, rgba(0,0,0,0.3), transparent)';
    overlay.style.zIndex = '1';
    content.appendChild(overlay);
    
    // Header section
    const header = document.createElement('div');
    header.style.position = 'relative';
    header.style.zIndex = '2';
    header.style.textAlign = 'center';
    
    const eventDate = new Date(currentEventForStory.isoDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const dateElement = document.createElement('div');
    dateElement.textContent = formattedDate;
    dateElement.style.fontSize = '48px';
    dateElement.style.opacity = '0.9';
    dateElement.style.marginBottom = '40px';
    dateElement.style.textTransform = 'uppercase';
    dateElement.style.letterSpacing = '4px';
    dateElement.style.fontWeight = '600';
    header.appendChild(dateElement);
    
    const titleElement = document.createElement('div');
    titleElement.textContent = currentEventForStory.eventName || 'Event';
    titleElement.style.fontSize = '80px';
    titleElement.style.fontWeight = '700';
    titleElement.style.marginBottom = '40px';
    titleElement.style.lineHeight = '1.2';
    titleElement.style.wordWrap = 'break-word';
    header.appendChild(titleElement);
    
    const categoryElement = document.createElement('div');
    categoryElement.textContent = currentEventForStory.category || 'Event';
    categoryElement.style.fontSize = '36px';
    categoryElement.style.background = 'rgba(255, 255, 255, 0.2)';
    categoryElement.style.padding = '16px 48px';
    categoryElement.style.borderRadius = '50px';
    categoryElement.style.display = 'inline-block';
    categoryElement.style.backdropFilter = 'blur(10px)';
    categoryElement.style.fontWeight = '500';
    header.appendChild(categoryElement);
    
    // Image section
    const imageContainer = document.createElement('div');
    imageContainer.style.position = 'relative';
    imageContainer.style.zIndex = '2';
    imageContainer.style.display = 'flex';
    imageContainer.style.justifyContent = 'center';
    imageContainer.style.alignItems = 'center';
    imageContainer.style.minHeight = '600px';
    
    if (currentEventForStory.imageUrl) {
        const img = document.createElement('img');
        img.src = currentEventForStory.imageUrl;
        img.style.width = '480px';
        img.style.height = '480px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        img.style.border = '12px solid rgba(255, 255, 255, 0.3)';
        img.style.boxShadow = '0 16px 60px rgba(0, 0, 0, 0.3)';
        imageContainer.appendChild(img);
    }
    
    // Footer section
    const footer = document.createElement('div');
    footer.style.position = 'relative';
    footer.style.zIndex = '2';
    footer.style.textAlign = 'center';
    
    const venueElement = document.createElement('div');
    venueElement.textContent = `📍 ${currentEventForStory.locationName || 'Ohrid'}`;
    venueElement.style.fontSize = '52px';
    venueElement.style.opacity = '0.9';
    venueElement.style.marginBottom = '32px';
    venueElement.style.fontWeight = '500';
    footer.appendChild(venueElement);
    
    const timeElement = document.createElement('div');
    timeElement.textContent = `🕐 ${currentEventForStory.startTime || '20:00'}`;
    timeElement.style.fontSize = '64px';
    timeElement.style.fontWeight = '600';
    timeElement.style.marginBottom = '40px';
    footer.appendChild(timeElement);
    
    const brandingElement = document.createElement('div');
    brandingElement.textContent = 'OHRIDHUB';
    brandingElement.style.fontSize = '44px';
    brandingElement.style.opacity = '0.8';
    brandingElement.style.fontWeight = '500';
    brandingElement.style.textTransform = 'uppercase';
    brandingElement.style.letterSpacing = '4px';
    footer.appendChild(brandingElement);
    
    // Assemble the structure
    content.appendChild(header);
    content.appendChild(imageContainer);
    content.appendChild(footer);
    tempPreview.appendChild(content);
    
    // Add to DOM temporarily
    document.body.appendChild(tempPreview);
    
    return tempPreview;
}

function downloadStoryImageManual() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Instagram Story dimensions with high DPI support
    const baseWidth = 1080;
    const baseHeight = 1920;
    const scale = window.devicePixelRatio || 2; // Use device pixel ratio or default to 2 for high quality
    
    // Set actual canvas size for high DPI
    canvas.width = baseWidth * scale;
    canvas.height = baseHeight * scale;
    
    // Scale the context to match the device pixel ratio
    ctx.scale(scale, scale);
    
    // Set canvas display size (CSS size)
    canvas.style.width = baseWidth + 'px';
    canvas.style.height = baseHeight + 'px';
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Enhanced gradients with more sophisticated colors
    const gradientColors = {
        'gradient-1': {
            colors: ['#667eea', '#764ba2'],
            angle: 135,
            name: 'Purple Dream'
        },
        'gradient-2': {
            colors: ['#f093fb', '#f5576c'],
            angle: 135,
            name: 'Sunset Glow'
        },
        'gradient-3': {
            colors: ['#4facfe', '#00f2fe'],
            angle: 135,
            name: 'Ocean Breeze'
        },
        'gradient-4': {
            colors: ['#43e97b', '#38f9d7'],
            angle: 135,
            name: 'Forest Fresh'
        },
        'gradient-5': {
            colors: ['#fa709a', '#fee140'],
            angle: 135,
            name: 'Golden Hour'
        }
    };
    
    const selectedGradient = gradientColors[selectedTemplate] || gradientColors['gradient-1'];
    const [color1, color2] = selectedGradient.colors;
    
    // Create enhanced gradient with radial overlay
    const gradient = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, baseWidth, baseHeight);
    
    // Add sophisticated overlay pattern
    const radialGradient = ctx.createRadialGradient(
        baseWidth / 2, baseHeight / 2, 0,
        baseWidth / 2, baseHeight / 2, baseWidth
    );
    radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    radialGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, baseWidth, baseHeight);
    
    // Add subtle texture pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < baseWidth; i += 4) {
        for (let j = 0; j < baseHeight; j += 4) {
            if (Math.random() > 0.7) {
                ctx.fillRect(i, j, 2, 2);
            }
        }
    }
    
    // Layout constants for better positioning
    const padding = 80;
    const headerY = 200;
    const imageY = 800;
    const footerY = 1550;
    
    // Enhanced text styling
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow function
    function addTextShadow(ctx, shadowColor = 'rgba(0, 0, 0, 0.3)', blur = 8) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = blur;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }
    
    // Reset shadow function
    function resetShadow(ctx) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    // Header section with enhanced styling
    
    // Date with improved styling
    const eventDate = new Date(currentEventForStory.isoDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).toUpperCase();
    
    addTextShadow(ctx);
    ctx.font = '600 32px system-ui, -apple-system, sans-serif';
    ctx.globalAlpha = 0.9;
    ctx.fillText(formattedDate, baseWidth / 2, headerY - 20);
    resetShadow(ctx);
    ctx.globalAlpha = 1;
    
    // Event title with enhanced typography
    addTextShadow(ctx);
    ctx.font = '700 64px system-ui, -apple-system, sans-serif';
    const title = currentEventForStory.eventName || 'Event';
    
    // Enhanced text wrapping with better line height
    wrapTextEnhanced(ctx, title, baseWidth / 2, headerY + 60, baseWidth - 160, 80);
    resetShadow(ctx);
    
    // Category badge with modern design
    const category = currentEventForStory.category || 'Event';
    ctx.font = '500 28px system-ui, -apple-system, sans-serif';
    const categoryMetrics = ctx.measureText(category);
    const badgeWidth = categoryMetrics.width + 60;
    const badgeHeight = 50;
    const badgeX = (baseWidth - badgeWidth) / 2;
    const badgeY = headerY + 200;
    
    // Enhanced badge with gradient and shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    
    // Create badge gradient
    const badgeGradient = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeHeight);
    badgeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    badgeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
    
    ctx.fillStyle = badgeGradient;
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
    
    // Add badge border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);
    
    resetShadow(ctx);
    
    // Badge text
    ctx.fillStyle = 'white';
    ctx.fillText(category, baseWidth / 2, badgeY + badgeHeight / 2);
    
    // Event image with enhanced styling
    if (currentEventForStory.imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Add timeout for image loading
        let imageLoadTimeout;
        
        img.onload = function() {
            clearTimeout(imageLoadTimeout);
            
            // Enhanced circular image with multiple effects
            const imageSize = 320; // Increased size for better mobile visibility
            const imageX = baseWidth / 2;
            const centerY = imageY;
            
            // Add glow effect behind image
            ctx.shadowColor = color2;
            ctx.shadowBlur = 40;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2 + 20, 0, 2 * Math.PI);
            ctx.fill();
            resetShadow(ctx);
            
            // Draw main image with clipping
            ctx.save();
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            
            // Add slight image enhancement
            ctx.filter = 'brightness(1.1) contrast(1.1) saturate(1.2)';
            ctx.drawImage(img, imageX - imageSize / 2, centerY - imageSize / 2, imageSize, imageSize);
            ctx.filter = 'none';
            ctx.restore();
            
            // Enhanced border with gradient
            const borderGradient = ctx.createLinearGradient(
                imageX - imageSize / 2, centerY - imageSize / 2,
                imageX + imageSize / 2, centerY + imageSize / 2
            );
            borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
            
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 8; // Increased border width
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Add inner highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2 - 4, 0, 2 * Math.PI);
            ctx.stroke();
            
            finishCanvasDrawing();
        };
        
        img.onerror = function() {
            clearTimeout(imageLoadTimeout);
            console.log('Image failed to load, creating placeholder');
            createPlaceholder();
        };
        
        // Set timeout for image loading (5 seconds)
        imageLoadTimeout = setTimeout(() => {
            console.log('Image loading timeout, creating placeholder');
            createPlaceholder();
        }, 5000);
        
        img.src = currentEventForStory.imageUrl;
    } else {
        createPlaceholder();
    }
    
    function createPlaceholder() {
        // Create attractive placeholder when no image
        const imageSize = 320; // Increased size for better mobile visibility
        const imageX = baseWidth / 2;
        const centerY = imageY;
        
        // Placeholder circle with gradient
        const placeholderGradient = ctx.createRadialGradient(
            imageX, centerY, 0,
            imageX, centerY, imageSize / 2
        );
        placeholderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        placeholderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        
        ctx.fillStyle = placeholderGradient;
        ctx.beginPath();
        ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add placeholder border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Add event icon in placeholder
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '80px system-ui, -apple-system, sans-serif'; // Increased icon size
        ctx.fillText('🎉', imageX, centerY);
        
        finishCanvasDrawing();
    }
    
    function finishCanvasDrawing() {
        // Footer section with enhanced styling
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        
        // Enhanced venue info
        addTextShadow(ctx);
        ctx.font = '500 38px system-ui, -apple-system, sans-serif';
        ctx.globalAlpha = 0.95;
        ctx.fillText(`📍 ${currentEventForStory.locationName || 'Ohrid'}`, baseWidth / 2, footerY);
        resetShadow(ctx);
        
        // Enhanced time info
        addTextShadow(ctx);
        ctx.font = '600 42px system-ui, -apple-system, sans-serif';
        ctx.globalAlpha = 1;
        ctx.fillText(`🕐 ${currentEventForStory.startTime || '20:00'}`, baseWidth / 2, footerY + 70);
        resetShadow(ctx);
        
        // Enhanced branding with subtle styling
        ctx.font = '600 32px system-ui, -apple-system, sans-serif';
        ctx.globalAlpha = 0.8;
        addTextShadow(ctx, 'rgba(0, 0, 0, 0.2)', 4);
        ctx.fillText('OHRIDHUB', baseWidth / 2, footerY + 140);
        resetShadow(ctx);
        
        // Add decorative elements
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'white';
        
        // Top decorative line
        ctx.fillRect(baseWidth / 2 - 40, 80, 80, 3);
        
        // Bottom decorative line
        ctx.fillRect(baseWidth / 2 - 40, 1840, 80, 3);
        
        ctx.globalAlpha = 1;
        
        downloadCanvas(canvas);
    }
    
    // Enhanced text wrapping function
    function wrapTextEnhanced(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        const lines = [];
        
        // First pass: determine all lines
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        if (line.trim()) {
            lines.push(line.trim());
        }
        
        // Second pass: draw centered lines
        const totalHeight = lines.length * lineHeight;
        let startY = y - totalHeight / 2 + lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, x, startY + index * lineHeight);
        });
    }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
}

function downloadCanvas(canvas) {
    try {
        // Create a temporary canvas at the correct resolution for download
        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        
        // Set the download canvas to Instagram Story dimensions
        downloadCanvas.width = 1080;
        downloadCanvas.height = 1920;
        
        // Enable high-quality rendering
        downloadCtx.imageSmoothingEnabled = true;
        downloadCtx.imageSmoothingQuality = 'high';
        
        // Draw the high-DPI canvas onto the download canvas, scaling it down
        downloadCtx.drawImage(canvas, 0, 0, downloadCanvas.width, downloadCanvas.height);
        
        // Create download link
        const link = document.createElement('a');
        const fileName = `${(currentEventForStory.eventName || 'event').replace(/[^a-z0-9]/gi, '_')}-instagram-story.png`;
        link.download = fileName;
        
        // Use maximum quality for the download
        link.href = downloadCanvas.toDataURL('image/png', 1.0);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Image downloaded successfully:', fileName);
    } catch (error) {
        console.error('Error during canvas download:', error);
        
        // Fallback: try direct download from original canvas
        try {
            const link = document.createElement('a');
            const fileName = `${(currentEventForStory.eventName || 'event').replace(/[^a-z0-9]/gi, '_')}-instagram-story.png`;
            link.download = fileName;
            link.href = canvas.toDataURL('image/png', 1.0);
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (fallbackError) {
            console.error('Fallback download also failed:', fallbackError);
            Toast.error('Unable to download the image. Please try again.', 'Download Failed');
        }
    }
}

function openInstagramApp() {
    try {
        // Check if it's a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Try to open Instagram app
            const instagramURL = 'instagram://camera';
            
            // Create a hidden iframe to try opening the app
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = instagramURL;
            document.body.appendChild(iframe);
            
            // Fallback to Instagram web after a short delay
            setTimeout(() => {
                document.body.removeChild(iframe);
                window.open('https://www.instagram.com/', '_blank');
            }, 1500);
        } else {
            // On desktop, open Instagram web
            window.open('https://www.instagram.com/', '_blank');
        }
    } catch (error) {
        console.error('Error opening Instagram:', error);
        // Fallback to Instagram web
        window.open('https://www.instagram.com/', '_blank');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeOrganizationPage();
    setupEventModalListeners();
    setupInstagramStoryModalListeners();
});

let eventsListData = []; // Store events data for modal access

async function initializeOrganizationPage() {
    const orgId = getOrganizationIdFromUrl();
    if (!orgId) {
        displayError('Could not find organization ID in URL.');
        return;
    }

    try {
        // Fetch the specific event by its ID
        const response = await fetch(`/api/organizations/${orgId}`);
        if (!response.ok) {
             if (response.status === 404) {
                displayError(`Organization with ID ${orgId} not found.`);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;
        }
        
        const organization = await response.json();

        if (organization) {
            renderOrganizationDetails(organization);
            fetchAndRenderAssociatedEvents(orgId);
        } else {
             // This case should ideally not be reached if the API returns 404 for not found
            displayError(`Organization with ID ${orgId} not found.`);
        }
    } catch (error) {
        console.error('Error fetching or rendering organization details:', error);
        displayError('Could not load organization details. Please try again later.');
    }
}

function getOrganizationIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length >= 3 && pathParts[1] === 'organizations') {
        return pathParts[2];
    }
    return null;
}

function renderOrganizationDetails(org) {
    document.title = `${org.title} - OhridHub`;
    document.getElementById('org-name').textContent = org.title;
    
    // Use longDescription if available, otherwise use the regular description.
    const description = org.longDescription || org.description || '';
    document.getElementById('org-description').innerHTML = description.replace(/\\n/g, '<br>');
    
    const mainImage = document.getElementById('org-main-image');
    mainImage.src = org.imageUrl || '/images_ohrid/placeholder.jpg';
    mainImage.alt = `Main image for ${org.title}`;

    const galleryContainer = document.getElementById('org-gallery');
    if (org.gallery && org.gallery.length > 0) {
        galleryContainer.innerHTML = ''; // Clear existing content
        org.gallery.forEach(imgSrc => {
            const slide = document.createElement('div');
            slide.className = 'keen-slider__slide';
            
            const imgContainer = document.createElement('div');
            imgContainer.className = 'gallery-image-container';
            imgContainer.innerHTML = `
                <img src="${imgSrc}" alt="Gallery image for ${org.title}" class="gallery-image" loading="lazy">
            `;
            
            slide.appendChild(imgContainer);
            galleryContainer.appendChild(slide);
        });
        
        // Initialize the slider after DOM is ready
        initializeGallerySlider();
    } else {
        document.getElementById('org-gallery-title').style.display = 'none';
        galleryContainer.style.display = 'none';
    }
}

async function fetchAndRenderAssociatedEvents(orgId) {
    try {
        const response = await fetch(`/api/organizations/${orgId}/events`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        eventsListData = events; // Store for modal access
        const container = document.getElementById('associated-events-container');

        if (events.length > 0) {
            document.getElementById('associated-events-title').style.display = 'block';
            container.innerHTML = '';
            
            // Sort events by date to ensure they appear in chronological order
            events.sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate));

            events.forEach(event => {
                const eventCard = createAssociatedEventCard(event);
                container.appendChild(eventCard);
            });
        } else {
            document.getElementById('associated-events-title').style.display = 'none';
        }
    } catch (error) {
        console.error('Could not fetch associated events:', error);
    }
}

function createAssociatedEventCard(event) {
    const card = document.createElement('div');
    card.className = 'associated-event-card';
    card.style.cursor = 'pointer';
    card.dataset.eventId = event.id;

    const title = event.eventName || 'Event';
    // Use shortDescription if available, otherwise truncate description
    const description = event.shortDescription || (event.description || '').substring(0, 100) + '...';
    const date = new Date(event.isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    card.innerHTML = `
        <div class="assoc-card-content">
            <h4 class="assoc-card-title">${title}</h4>
            <p class="assoc-card-date">${date}</p>
            <p class="assoc-card-description">${description}</p>
        </div>
    `;

    // Add click handler to open event modal
    card.addEventListener('click', () => {
        openEventModal(event.id);
    });
    
    return card;
}

function displayError(message) {
    const container = document.querySelector('#organization-page .container');
    if (container) {
        container.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
    }
}

function setupEventModalListeners() {
    const eventModal = document.getElementById('event-detail-modal');
    eventModal?.querySelector('#event-detail-modal-close-button')?.addEventListener('click', closeEventModal);
    eventModal?.addEventListener('click', (e) => {
        if (e.target === eventModal) closeEventModal();
    });
    
    // Share event button
    document.getElementById('modal-event-share-btn')?.addEventListener('click', shareCurrentEvent);
    
    // Instagram Story button
    document.getElementById('modal-instagram-story-btn')?.addEventListener('click', openInstagramStoryModal);

    const imageModal = document.getElementById('image-modal');
    const imageModalClose = document.getElementById('image-modal-close');

    imageModalClose?.addEventListener('click', () => {
        imageModal.classList.add('hidden');
    });

    imageModal?.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.add('hidden');
        }
    });
}

function openEventModal(eventId) {
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) return;

    const modal = document.getElementById('event-detail-modal');
    if (!modal) return;

    // Store current event ID for sharing
    modal.dataset.eventId = eventId;

    modal.querySelector('#modal-event-name').textContent = event.eventName;

    const eventDescriptionEl = modal.querySelector('#modal-event-description');
    if (event.longDescription || event.description) {
        // Replace newline characters with <br> tags to render paragraphs
        eventDescriptionEl.innerHTML = (event.longDescription || event.description).replace(/\n/g, '<br>');
    } else {
        eventDescriptionEl.style.display = 'none';
    }

    const eventImageEl = modal.querySelector('#modal-event-image');
    if (event.imageUrl) {
        eventImageEl.src = event.imageUrl;
        eventImageEl.alt = event.eventName;
        eventImageEl.style.display = 'block';
        eventImageEl.style.cursor = 'pointer';

        // Add the click listener here, right after setting the src, to open the existing image modal
        eventImageEl.onclick = () => {
             const imageModal = document.getElementById('image-modal');
             const modalImageContent = document.getElementById('modal-image-content');
             if (imageModal && modalImageContent) {
                modalImageContent.src = eventImageEl.src;
                imageModal.classList.remove('hidden');
             }
        };

    } else {
        eventImageEl.style.display = 'none';
        eventImageEl.onclick = null;
    }
    
    modal.querySelector('#modal-event-category').textContent = event.category;

    const mapContainer = modal.querySelector('#modal-event-location-map');
    if (mapContainer) {
        let iframe = null;
        if (event.locationIframe) {
            iframe = event.locationIframe;
        } else if (event.mapIframe) {
            iframe = event.mapIframe;
        }

        if (iframe) {
            mapContainer.innerHTML = iframe;
            mapContainer.style.display = 'block';
        } else {
            mapContainer.style.display = 'none';
        }
    }

    const bookingBtn = document.getElementById('modal-event-booking-btn');
    if (event.eventBookingUrl && event.eventBookingUrl !== '#') {
        bookingBtn.href = event.eventBookingUrl;
        bookingBtn.style.display = 'inline-flex';
    } else {
        bookingBtn.style.display = 'none';
    }

    const dateTimeEl = modal.querySelector('#modal-event-date-time');
    if(dateTimeEl) {
        const date = new Date(event.isoDate);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        dateTimeEl.textContent = `${day}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${event.startTime}`;
    }

    const contactEl = modal.querySelector('#modal-event-contact');
    const contactPhoneEl = modal.querySelector('#modal-event-contact-phone');
    if (event.eventContact && contactEl && contactPhoneEl) {
        contactPhoneEl.textContent = event.eventContact;
        contactEl.style.display = 'flex';
    } else if (contactEl) {
        contactEl.style.display = 'none';
    }

    const ticketEl = modal.querySelector('#modal-event-ticket');
    const ticketPriceEl = modal.querySelector('#modal-event-ticket-price');
    if (event.ticketPrice && ticketEl && ticketPriceEl) {
        // Make the price clickable if eventBookingUrl exists
        if (event.eventBookingUrl && event.eventBookingUrl !== '#' && event.eventBookingUrl.trim() !== '') {
            ticketPriceEl.innerHTML = `<a href="${event.eventBookingUrl}" target="_blank" style="font-weight: bold; text-decoration: none; cursor: pointer; color: inherit;">${event.ticketPrice}</a>`;
        } else {
            ticketPriceEl.textContent = event.ticketPrice;
        }
        ticketEl.style.display = 'flex';
    } else if (ticketEl) {
        ticketEl.style.display = 'none';
    }



    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    const modal = document.getElementById('event-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function shareCurrentEvent() {
    const modal = document.getElementById('event-detail-modal');
    const eventId = modal?.dataset.eventId;
    
    if (!eventId) return;
    
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) return;
    
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    const eventTitle = event.eventName;
    const shareBtn = document.getElementById('modal-event-share-btn');
    
    // Always copy to clipboard directly - no native share dialog
    navigator.clipboard.writeText(eventUrl).then(() => {
        showEventNotification('Event link copied to clipboard!');
        
        // Add visual feedback
        if (shareBtn) {
            shareBtn.classList.add('copied');
            setTimeout(() => {
                shareBtn.classList.remove('copied');
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback to showing the URL
        prompt('Copy this link to share:', eventUrl);
    });
}

function showEventNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize gallery slider
function initializeGallerySlider() {
    const galleryContainer = document.getElementById('org-gallery');
    if (!galleryContainer || typeof KeenSlider === 'undefined') return;
    
    const slider = new KeenSlider('#org-gallery', {
        loop: false,
        slides: { 
            perView: 3,
            spacing: 16
        },
        breakpoints: {
            '(max-width: 768px)': {
                slides: { perView: 2, spacing: 12 }
            },
            '(max-width: 480px)': {
                slides: { perView: 1, spacing: 8 }
            }
        },
        created(s) {
            updateArrows(s);
        },
        slideChanged(s) {
            updateArrows(s);
        }
    });
    
    function updateArrows(s) {
        const leftArrow = document.getElementById('org-gallery-arrow-left');
        const rightArrow = document.getElementById('org-gallery-arrow-right');
        
        if (leftArrow && rightArrow) {
            // Show/hide arrows based on current position
            leftArrow.style.opacity = s.track.details.rel === 0 ? '0.3' : '1';
            rightArrow.style.opacity = s.track.details.rel === s.track.details.slides.length - s.options.slides.perView ? '0.3' : '1';
            
            leftArrow.style.pointerEvents = s.track.details.rel === 0 ? 'none' : 'auto';
            rightArrow.style.pointerEvents = s.track.details.rel === s.track.details.slides.length - s.options.slides.perView ? 'none' : 'auto';
        }
    }
    
    // Setup navigation arrows
    const leftArrow = document.getElementById('org-gallery-arrow-left');
    const rightArrow = document.getElementById('org-gallery-arrow-right');
    
    if (leftArrow && rightArrow) {
        leftArrow.addEventListener('click', () => slider.prev());
        rightArrow.addEventListener('click', () => slider.next());
    }
    
    // Add click functionality to images for fullscreen view
    const images = galleryContainer.querySelectorAll('.gallery-image');
    images.forEach(img => {
        img.addEventListener('click', () => {
            const imageModal = document.getElementById('image-modal');
            const modalImage = document.getElementById('modal-image-content');
            if (imageModal && modalImage) {
                modalImage.src = img.src;
                modalImage.alt = img.alt;
                imageModal.classList.remove('hidden');
            }
        });
    });
} 