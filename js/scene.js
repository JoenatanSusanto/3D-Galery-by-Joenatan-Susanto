import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Scene3D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.autoRotate = true;
        this.gridView = false;
        
        this.init();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 5, 30);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(5, 3, 8);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
        
        // Add controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 1.8;
        
        // Add lighting
        this.setupLighting();
        
        // Add environment
        this.setupEnvironment();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 2);
        mainLight.position.set(5, 8, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        mainLight.shadow.bias = -0.0001;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x6366f1, 0.8);
        fillLight.position.set(-3, 2, -3);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0x764ba2, 1);
        rimLight.position.set(0, -1, 5);
        this.scene.add(rimLight);
        
        // Point lights for accent
        const pointLight1 = new THREE.PointLight(0x6366f1, 1, 10);
        pointLight1.position.set(3, 2, 3);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x764ba2, 1, 10);
        pointLight2.position.set(-3, 2, -3);
        this.scene.add(pointLight2);
    }
    
    setupEnvironment() {
        // Ground plane
        const groundGeometry = new THREE.CircleGeometry(8, 64);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Grid helper
        const gridHelper = new THREE.PolarGridHelper(8, 32, 24, 64, 0x2a2a2a, 0x2a2a2a);
        gridHelper.position.y = -1.99;
        this.scene.add(gridHelper);
        
        // Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500;
        const posArray = new Float32Array(particlesCount * 3);
        
        for (let i = 0; i < particlesCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 20;
            posArray[i + 1] = (Math.random() - 0.5) * 15;
            posArray[i + 2] = (Math.random() - 0.5) * 20;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x6366f1,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(particles);
    }
    
    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        this.controls.autoRotate = this.autoRotate;
    }
    
    resetCamera() {
        this.camera.position.set(5, 3, 8);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    setGridView() {
        this.gridView = true;
        this.camera.position.set(0, 8, 10);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        this.controls.autoRotateSpeed = 0.3;
    }
    
    setSingleView() {
        this.gridView = false;
        this.controls.autoRotateSpeed = 0.5;
    }
    
    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}