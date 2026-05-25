import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class Models {
    constructor(scene3D) {
        this.scene3D = scene3D;
        this.scene = scene3D.scene;
        this.models = [];
        this.loader = null;
        this.wireframe = false;
        
        this.initLoader();
    }
    
    initLoader() {
        this.loader = new GLTFLoader();
        
        // Setup DRACOLoader for compressed models
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.loader.setDRACOLoader(dracoLoader);
    }
    
    async loadModels(paths, names, descriptions, mediaData) {
        const promises = paths.map((path, index) => {
            return new Promise((resolve, reject) => {
                this.loader.load(
                    path,
                    (gltf) => {
                        const model = gltf.scene;
                        
                        // Center and scale model
                        const box = new THREE.Box3().setFromObject(model);
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());
                        
                        const maxDim = Math.max(size.x, size.y, size.z);
                        const scale = 2 / maxDim;
                        
                        model.scale.setScalar(scale);
                        model.position.sub(center.multiplyScalar(scale));
                        
                        // Enable shadows
                        model.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        
                        // Store model data
                        this.models[index] = {
                            mesh: model,
                            name: names[index],
                            description: descriptions[index],
                            media: mediaData[index],
                            index: index + 1,
                            position: this.getGridPosition(index + 1)
                        };
                        
                        resolve(model);
                    },
                    (progress) => {
                        console.log(`Loading model ${index + 1}: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
                    },
                    (error) => {
                        console.error(`Error loading model ${index + 1}:`, error);
                        // Create placeholder geometry
                        const placeholder = this.createPlaceholder(index + 1);
                        this.models[index] = {
                            mesh: placeholder,
                            name: names[index],
                            description: descriptions[index],
                            media: mediaData[index],
                            index: index + 1,
                            position: this.getGridPosition(index + 1)
                        };
                        resolve(placeholder);
                    }
                );
            });
        });
        
        await Promise.all(promises);
        
        // Position all models in grid
        this.positionInGrid();
    }
    
    getGridPosition(index) {
        // Arrange in a circle with 4 models
        const angle = (index - 1) * (Math.PI * 2 / 4) - Math.PI / 2;
        const radius = 4;
        return new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
    }
    
    positionInGrid() {
        this.models.forEach((modelData, i) => {
            if (modelData && modelData.mesh) {
                const pos = modelData.position;
                modelData.mesh.position.copy(pos);
                this.scene.add(modelData.mesh);
            }
        });
    }
    
    createPlaceholder(index) {
        const group = new THREE.Group();
        
        // Create different geometries for each placeholder
        const geometries = [
            new THREE.IcosahedronGeometry(0.8, 1),
            new THREE.OctahedronGeometry(0.8, 1),
            new THREE.TetrahedronGeometry(0.8, 1),
            new THREE.DodecahedronGeometry(0.8, 1)
        ];
        
        const geometry = geometries[index - 1] || geometries[0];
        const material = new THREE.MeshStandardMaterial({
            color: 0x6366f1,
            roughness: 0.3,
            metalness: 0.7,
            wireframe: false
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        
        // Add wireframe overlay
        const wireframeMesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true,
                transparent: true,
                opacity: 0.1
            })
        );
        group.add(wireframeMesh);
        
        return group;
    }
    
    showAllModels() {
        this.models.forEach(modelData => {
            if (modelData && modelData.mesh) {
                modelData.mesh.visible = true;
                modelData.mesh.position.copy(modelData.position);
                modelData.mesh.rotation.set(0, 0, 0);
            }
        });
        
        // Adjust camera for grid view
        this.scene3D.camera.position.set(0, 8, 10);
        this.scene3D.controls.target.set(0, 0, 0);
    }
    
    showSingleModel(index) {
        this.models.forEach((modelData, i) => {
            if (modelData && modelData.mesh) {
                if (i === index - 1) {
                    modelData.mesh.visible = true;
                    modelData.mesh.position.set(-1, 0, 0); // Offset to the left to make room for media panel
                    modelData.mesh.rotation.set(0, Math.PI / 4, 0);
                } else {
                    modelData.mesh.visible = false;
                }
            }
        });
        
        // Adjust camera for single view
        this.scene3D.camera.position.set(3, 2, 6);
        this.scene3D.controls.target.set(-1, 0, 0);
    }
    
    toggleWireframe() {
        this.wireframe = !this.wireframe;
        
        this.models.forEach(modelData => {
            if (modelData && modelData.mesh) {
                modelData.mesh.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.wireframe = this.wireframe;
                            });
                        } else {
                            child.material.wireframe = this.wireframe;
                        }
                    }
                });
            }
        });
    }
    
    getModelData(index) {
        return this.models[index - 1] || null;
    }
    
    updateAnimations() {
        // Rotate models slightly when in grid view
        if (this.scene3D.gridView) {
            this.models.forEach((modelData, i) => {
                if (modelData && modelData.mesh) {
                    modelData.mesh.rotation.y += 0.002;
                }
            });
        }
    }
}