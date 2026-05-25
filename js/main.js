import { Scene3D } from './scene.js';
import { Navigation } from './navigation.js';
import { Models } from './models.js';
import { MediaViewer } from './mediaViewer.js';

class App {
    constructor() {
        this.scene3D = null;
        this.navigation = null;
        this.models = null;
        this.mediaViewer = null;
        this.currentModel = 0;
        this.isLoading = true;
        this.isGridView = false;
        
        this.init();
    }
    
    async init() {
        // Initialize components
        this.scene3D = new Scene3D(document.getElementById('canvasContainer'));
        this.navigation = new Navigation();
        this.models = new Models(this.scene3D);
        this.mediaViewer = new MediaViewer();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load all models
        await this.loadAllModels();
        
        // Show all models initially (grid view)
        this.showAllModels();
        
        // Hide loader
        this.hideLoader();
        
        // Start animation loop
        this.animate();
    }
    
    async loadAllModels() {
        const modelPaths = [
            'models/model1.glb',
            'models/model2.glb',
            'models/model3.glb',
            'models/model4.glb'
        ];
        
        const modelNames = [
            'EcoBump',
            'Industrial Robots',
            'Chassis Drone',
            'Roadkepeer V1'
        ];
        
        const modelDescriptions = [
            'Menciptakan sebuah inovasi bernama Ecobump yang mengubah gaya kinetik menjadi energi listrik.',
            'Desain robot industri yang efesien dan inovatif.',
            'Inovasi dalam desain drone chasis yang ringan namun kuat.',
            'Inovasi dalam desain kendaraan jalan yang efisien dan ramah lingkungan.'
        ];
        
        // Define media for each model
        const modelMedia = [
            {
                images: [
                    { type: 'video', src: 'media/model1/video1.mp4' }
                ]
            },
            {
                images: [
                    { type: 'video', src: 'media/model2/video1.mkv' }
                ]
            },
            {
                images: [
                    
                ]
            },
            {
                images: [
                    { type: 'video', src: 'media/model4/0525(1).mov' },
                    { type: 'image', src: 'media/model4/image1.png' },
                    { type: 'image', src: 'media/model4/image2.png' },
                    { type: 'image', src: 'media/model4/image3.png' },
                ]
            }
        ];
        
        try {
            await this.models.loadModels(modelPaths, modelNames, modelDescriptions, modelMedia);
            this.mediaViewer.setMediaData(modelMedia);
        } catch (error) {
            console.error('Error loading models:', error);
            this.showError('Failed to load 3D models. Please check the console for details.');
        }
    }
    
    setupEventListeners() {
        // Navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modelIndex = parseInt(e.target.dataset.model);
                this.selectModel(modelIndex);
                
                // Update active button
                navButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Toggle media panel button
        document.getElementById('toggleMediaBtn').addEventListener('click', () => {
            if (this.currentModel === 0) return; // Don't toggle in grid view
            this.mediaViewer.togglePanel();
        });
        
        // 3D Control buttons
        document.getElementById('resetView').addEventListener('click', () => {
            this.scene3D.resetCamera();
        });
        
        document.getElementById('autoRotate').addEventListener('click', (e) => {
            this.scene3D.toggleAutoRotate();
            e.target.classList.toggle('active');
        });
        
        document.getElementById('toggleWireframe').addEventListener('click', (e) => {
            this.models.toggleWireframe();
            e.target.classList.toggle('active');
        });
        
        // Grid view toggle
        document.getElementById('gridViewBtn').addEventListener('click', (e) => {
            this.toggleGridView();
            e.target.classList.toggle('active');
        });
        
        // Info button
        document.getElementById('infoBtn').addEventListener('click', () => {
            this.showInfoModal();
        });
        
        // Fullscreen modal controls
        document.getElementById('fsCloseBtn').addEventListener('click', () => {
            this.mediaViewer.closeFullscreen();
        });
        
        document.getElementById('fsDownloadBtn').addEventListener('click', () => {
            // Download current fullscreen media
            const mediaItems = this.mediaViewer.getCurrentModelMedia();
            if (mediaItems && mediaItems.length > 0) {
                // Get the first media item (since we're in fullscreen, we need to track current index)
                // For simplicity, we'll download based on what's displayed
                const currentSrc = this.mediaViewer.fullscreenContent.querySelector('img, video')?.src;
                if (currentSrc) {
                    const media = mediaItems.find(m => m.src === currentSrc);
                    if (media) {
                        this.mediaViewer.downloadMedia(media);
                    }
                }
            }
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when in fullscreen
            if (document.getElementById('fullscreenModal').classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.mediaViewer.closeFullscreen();
                }
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case '1': this.selectModel(1); break;
                case '2': this.selectModel(2); break;
                case '3': this.selectModel(3); break;
                case '4': this.selectModel(4); break;
                case '0': this.selectModel(0); break;
                case 'r': this.scene3D.resetCamera(); break;
                case 'a': this.scene3D.toggleAutoRotate(); break;
                case 'w': this.models.toggleWireframe(); break;
                case 'g': this.toggleGridView(); break;
                case 'm': 
                    if (this.currentModel !== 0) {
                        this.mediaViewer.togglePanel();
                    }
                    break;
            }
        });
    }
    
    selectModel(index) {
        this.currentModel = index;
        
        if (index === 0) {
            this.showAllModels();
            // Hide media panel when in grid view
            this.mediaViewer.hidePanel();
        } else {
            this.showSingleModel(index);
            // Show media for selected model but don't open panel automatically
            this.mediaViewer.showMediaForModel(index - 1);
        }
        
        // Update info panel
        this.updateModelInfo(index);
    }
    
    showAllModels() {
        this.isGridView = true;
        this.models.showAllModels();
        this.scene3D.setGridView();
        
        // Update grid view button
        document.getElementById('gridViewBtn').classList.add('active');
        
        // Disable media toggle button
        document.getElementById('toggleMediaBtn').style.opacity = '0.5';
        document.getElementById('toggleMediaBtn').style.pointerEvents = 'none';
    }
    
    showSingleModel(index) {
        this.isGridView = false;
        this.models.showSingleModel(index);
        this.scene3D.setSingleView();
        
        // Update grid view button
        document.getElementById('gridViewBtn').classList.remove('active');
        
        // Enable media toggle button
        document.getElementById('toggleMediaBtn').style.opacity = '1';
        document.getElementById('toggleMediaBtn').style.pointerEvents = 'auto';
    }
    
    toggleGridView() {
        if (this.isGridView) {
            if (this.currentModel === 0) {
                this.selectModel(1);
            } else {
                this.selectModel(this.currentModel);
            }
        } else {
            this.selectModel(0);
        }
    }
    
    updateModelInfo(index) {
        const infoPanel = document.getElementById('modelInfo');
        const title = document.getElementById('modelTitle');
        const description = document.getElementById('modelDescription');
        const stats = document.getElementById('modelStats');
        
        if (index === 0) {
            title.textContent = 'All Models';
            description.textContent = 'Viewing all 4 models in grid layout. Click on a model or use navigation to focus on a single model and view its media gallery.';
            stats.innerHTML = `
                <div class="stat">
                    <span class="stat-dot"></span>
                    <span>4 Models</span>
                </div>
                <div class="stat">
                    <span class="stat-dot"></span>
                    <span>Grid View</span>
                </div>
            `;
        } else {
            const modelData = this.models.getModelData(index);
            if (modelData) {
                title.textContent = modelData.name;
                description.textContent = modelData.description;
                
                const polyCount = modelData.mesh ? this.getPolygonCount(modelData.mesh) : 'N/A';
                const mediaCount = modelData.media?.images?.length || 0;
                
                stats.innerHTML = `
                    <div class="stat">
                        <span class="stat-dot"></span>
                        <span>Polygons: ${polyCount}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-dot"></span>
                        <span>Media: ${mediaCount} files</span>
                    </div>
                    <div class="stat">
                        <span class="stat-dot"></span>
                        <span>Press M for media</span>
                    </div>
                `;
            }
        }
        
        infoPanel.classList.remove('hidden');
    }
    
    getPolygonCount(mesh) {
        let count = 0;
        mesh.traverse((child) => {
            if (child.isMesh) {
                const geometry = child.geometry;
                if (geometry.index) {
                    count += geometry.index.count / 3;
                } else {
                    count += geometry.attributes.position.count / 3;
                }
            }
        });
        return Math.round(count).toLocaleString();
    }
    
    showInfoModal() {
        alert('🎨 3D Gallery with Media Viewer\n\n' +
              '3D Controls:\n' +
              '- Mouse: Rotate | Zoom | Pan\n' +
              '- Keys 1-4: Select model\n' +
              '- Key 0: Grid view\n' +
              '- Key R: Reset view\n' +
              '- Key A: Auto-rotate\n' +
              '- Key W: Wireframe\n' +
              '- Key G: Toggle grid view\n' +
              '- Key M: Toggle media panel\n\n' +
              'Media Controls:\n' +
              '- Click media toggle button (top right) to show/hide gallery\n' +
              '- Scroll through media in the side panel\n' +
              '- Hover over media cards to see actions\n' +
              '- Click fullscreen icon or card to enlarge\n' +
              '- Click download icon to save media\n\n' +
              'Select a model to access its media gallery!');
    }
    
    showError(message) {
        const loader = document.getElementById('loader');
        const loaderText = loader.querySelector('.loader-text');
        loaderText.textContent = message;
        loaderText.style.color = '#ff4444';
    }
    
    hideLoader() {
        const loader = document.getElementById('loader');
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.scene3D && this.models) {
            this.scene3D.render();
            this.models.updateAnimations();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});