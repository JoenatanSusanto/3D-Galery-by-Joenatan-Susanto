export class MediaViewer {
    constructor() {
        this.mediaData = [];
        this.currentModelIndex = -1;
        this.isPanelOpen = false;
        this.fullscreenOpen = false;
        
        this.initElements();
    }
    
    initElements() {
        this.mediaPanel = document.getElementById('mediaPanel');
        this.mediaScrollContainer = document.getElementById('mediaScrollContainer');
        this.mediaCountBadge = document.getElementById('mediaCountBadge');
        this.toggleMediaBtn = document.getElementById('toggleMediaBtn');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.controls3d = document.getElementById('controls3d');
        this.gridViewBtn = document.getElementById('gridViewBtn');
        this.modelInfo = document.getElementById('modelInfo');
        
        // Fullscreen elements
        this.fullscreenModal = document.getElementById('fullscreenModal');
        this.fullscreenContent = document.getElementById('fullscreenContent');
        this.fullscreenTitle = document.getElementById('fullscreenTitle');
    }
    
    setMediaData(data) {
        this.mediaData = data;
    }
    
    showMediaForModel(modelIndex) {
        if (modelIndex < 0 || modelIndex >= this.mediaData.length) {
            this.clearMediaPanel();
            return;
        }
        
        this.currentModelIndex = modelIndex;
        this.renderMediaCards();
        this.updateMediaCount();
        
        // Update toggle button state
        this.toggleMediaBtn.classList.add('has-media');
    }
    
    clearMediaPanel() {
        this.mediaScrollContainer.innerHTML = `
            <div class="media-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No media available</p>
            </div>
        `;
        
        this.mediaCountBadge.textContent = '0 items';
        this.toggleMediaBtn.classList.remove('has-media');
    }
    
    renderMediaCards() {
        const mediaItems = this.getCurrentModelMedia();
        
        if (!mediaItems || mediaItems.length === 0) {
            this.clearMediaPanel();
            return;
        }
        
        this.mediaScrollContainer.innerHTML = '';
        
        mediaItems.forEach((media, index) => {
            const card = this.createMediaCard(media, index);
            this.mediaScrollContainer.appendChild(card);
        });
    }
    
    createMediaCard(media, index) {
        const card = document.createElement('div');
        card.className = 'media-card';
        card.setAttribute('data-index', index);
        
        // Media element
        if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = `Media ${index + 1}`;
            img.loading = 'lazy';
            
            img.onerror = () => {
                card.innerHTML = `
                    <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary);">
                        <p style="color: var(--text-secondary);">Image not found</p>
                    </div>
                `;
            };
            
            card.appendChild(img);
        } else if (media.type === 'video') {
            const video = document.createElement('video');
            video.src = media.src;
            video.preload = 'metadata';
            video.muted = true;
            
            video.onerror = () => {
                card.innerHTML = `
                    <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary);">
                        <p style="color: var(--text-secondary);">Video not found</p>
                    </div>
                `;
            };
            
            // Play video on hover
            card.addEventListener('mouseenter', () => {
                video.play().catch(() => {});
            });
            
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
            
            card.appendChild(video);
        }
        
        // Type badge
        const typeBadge = document.createElement('div');
        typeBadge.className = 'media-card-type-badge';
        typeBadge.textContent = media.type === 'image' ? 'Photo' : 'Video';
        card.appendChild(typeBadge);
        
        // Overlay with actions
        const overlay = document.createElement('div');
        overlay.className = 'media-card-overlay';
        
        const actions = document.createElement('div');
        actions.className = 'media-card-actions';
        
        // Fullscreen button
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'media-card-action-btn';
        fullscreenBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        fullscreenBtn.title = 'View Fullscreen';
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openFullscreen(index);
        });
        
        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'media-card-action-btn';
        downloadBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M17 10L12 15M12 15L7 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        downloadBtn.title = 'Download';
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.downloadMedia(media);
        });
        
        actions.appendChild(fullscreenBtn);
        actions.appendChild(downloadBtn);
        overlay.appendChild(actions);
        card.appendChild(overlay);
        
        // Click on card to open fullscreen
        card.addEventListener('click', () => {
            this.openFullscreen(index);
        });
        
        return card;
    }
    
    togglePanel() {
        if (this.currentModelIndex < 0) return;
        
        this.isPanelOpen = !this.isPanelOpen;
        
        if (this.isPanelOpen) {
            this.openPanel();
        } else {
            this.closePanel();
        }
    }
    
    openPanel() {
        this.isPanelOpen = true;
        this.mediaPanel.classList.add('open');
        this.canvasContainer.classList.add('shifted');
        this.controls3d.classList.add('shifted');
        this.gridViewBtn.classList.add('shifted');
        this.modelInfo.classList.add('shifted');
        this.toggleMediaBtn.classList.add('active');
    }
    
    closePanel() {
        this.isPanelOpen = false;
        this.mediaPanel.classList.remove('open');
        this.canvasContainer.classList.remove('shifted');
        this.controls3d.classList.remove('shifted');
        this.gridViewBtn.classList.remove('shifted');
        this.modelInfo.classList.remove('shifted');
        this.toggleMediaBtn.classList.remove('active');
    }
    
    hidePanel() {
        this.closePanel();
        this.currentModelIndex = -1;
        this.clearMediaPanel();
        this.toggleMediaBtn.classList.remove('has-media', 'active');
    }
    
    getCurrentModelMedia() {
        if (this.currentModelIndex < 0 || this.currentModelIndex >= this.mediaData.length) {
            return [];
        }
        return this.mediaData[this.currentModelIndex]?.images || [];
    }
    
    updateMediaCount() {
        const mediaItems = this.getCurrentModelMedia();
        if (mediaItems && mediaItems.length > 0) {
            this.mediaCountBadge.textContent = `${mediaItems.length} item${mediaItems.length > 1 ? 's' : ''}`;
        } else {
            this.mediaCountBadge.textContent = '0 items';
        }
    }
    
    openFullscreen(mediaIndex) {
        const mediaItems = this.getCurrentModelMedia();
        if (!mediaItems || mediaItems.length === 0) return;
        
        const media = mediaItems[mediaIndex];
        this.renderFullscreenMedia(media);
        
        this.fullscreenModal.classList.add('active');
        this.fullscreenOpen = true;
        
        // Update title
        const modelName = `Model ${this.currentModelIndex + 1}`;
        this.fullscreenTitle.textContent = `${modelName} - ${media.type === 'image' ? 'Image' : 'Video'} Preview`;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    closeFullscreen() {
        this.fullscreenModal.classList.remove('active');
        this.fullscreenOpen = false;
        
        // Clear fullscreen content
        this.fullscreenContent.innerHTML = '';
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Stop any playing videos
        const video = this.fullscreenContent.querySelector('video');
        if (video) {
            video.pause();
        }
    }
    
    renderFullscreenMedia(media) {
        this.fullscreenContent.innerHTML = '';
        
        if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = 'Fullscreen preview';
            
            img.onerror = () => {
                this.fullscreenContent.innerHTML = '<p style="color: white; font-size: 18px;">Image failed to load</p>';
            };
            
            this.fullscreenContent.appendChild(img);
        } else if (media.type === 'video') {
            const video = document.createElement('video');
            video.src = media.src;
            video.controls = true;
            video.autoplay = true;
            video.style.maxWidth = '90%';
            video.style.maxHeight = '90%';
            
            video.onerror = () => {
                this.fullscreenContent.innerHTML = '<p style="color: white; font-size: 18px;">Video failed to load</p>';
            };
            
            this.fullscreenContent.appendChild(video);
        }
    }
    
    downloadMedia(media) {
        const link = document.createElement('a');
        link.href = media.src;
        link.download = media.src.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}