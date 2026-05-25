export class Navigation {
    constructor() {
        this.currentModel = 0;
        this.init();
    }
    
    init() {
        // Add keyboard shortcut hints
        this.showKeyboardHints();
    }
    
    showKeyboardHints() {
        console.log('🎮 3D Gallery Controls:');
        console.log('  Keys 1-4: Select individual models');
        console.log('  Key 0: Show all models (grid view)');
        console.log('  Key R: Reset camera view');
        console.log('  Key A: Toggle auto-rotate');
        console.log('  Key W: Toggle wireframe mode');
        console.log('  Key G: Toggle grid/single view');
        console.log('  Arrow Left/Right: Navigate media gallery');
        console.log('  ESC: Close fullscreen');
        console.log('  Mouse: Rotate | Scroll: Zoom | Right-click: Pan');
    }
    
    selectModel(index) {
        this.currentModel = index;
        console.log(`Selected model: ${index === 0 ? 'All Models' : `Model ${index}`}`);
    }
}