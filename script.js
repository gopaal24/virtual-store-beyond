import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Create loading manager and loading screen elements
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.createElement('div');
const loadingBar = document.createElement('div');
const loadingText = document.createElement('div');

// Set up loading screen styling
loadingScreen.style.position = 'fixed';
loadingScreen.style.top = '0';
loadingScreen.style.left = '0';
loadingScreen.style.width = '100%';
loadingScreen.style.height = '100%';
loadingScreen.style.background = '#000';
loadingScreen.style.display = 'flex';
loadingScreen.style.flexDirection = 'column';
loadingScreen.style.alignItems = 'center';
loadingScreen.style.justifyContent = 'center';
loadingScreen.style.zIndex = '1000';

// Set up loading bar styling
loadingBar.style.width = '50%';
loadingBar.style.height = '10px';
loadingBar.style.background = '#333';
loadingBar.style.borderRadius = '5px';
loadingBar.style.overflow = 'hidden';
loadingBar.style.margin = '20px 0';

// Create progress element inside loading bar
const progress = document.createElement('div');
progress.style.width = '0%';
progress.style.height = '100%';
progress.style.background = '#ff9900';
progress.style.transition = 'width 0.2s';
loadingBar.appendChild(progress);

// Set up loading text styling
loadingText.textContent = 'Loading textures...';
loadingText.style.color = '#fff';
loadingText.style.fontFamily = 'Arial, sans-serif';
loadingText.style.fontSize = '18px';

// Add elements to loading screen and body
loadingScreen.appendChild(loadingText);
loadingScreen.appendChild(loadingBar);
document.body.appendChild(loadingScreen);

// Configure loading manager callbacks
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progressPercent = (itemsLoaded / itemsTotal) * 100;
    progress.style.width = progressPercent + '%';
    loadingText.textContent = `Loading textures... ${Math.floor(progressPercent)}%`;
};

loadingManager.onLoad = function () {
    // Hide loading screen with fade-out effect
    loadingScreen.style.transition = 'opacity 1s';
    loadingScreen.style.opacity = '0';
    
    // Remove loading screen after fade-out
    setTimeout(() => {
        document.body.removeChild(loadingScreen);
    }, 1000);
    
    // Start the animation loop
    animate();
};

loadingManager.onError = function (url) {
    console.error('Error loading', url);
    loadingText.textContent = 'Error loading textures. Please refresh the page.';
    loadingText.style.color = '#ff0000';
};

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let flag = true;

const map1 = [
    './assets/map1/left.jpg', 
    './assets/map1/right.jpg', 
    './assets/map1/up.jpg', 
    './assets/map1/down.jpg', 
    './assets/map1/front.jpg',  
    './assets/map1/back.jpg', 
];
const map2 = [
    './assets/map2/left.jpg', 
    './assets/map2/right.jpg', 
    './assets/map2/up.jpg', 
    './assets/map2/down.jpg', 
    './assets/map2/front.jpg',  
    './assets/map2/back.jpg', 
];

// Preload all textures
const loader = new THREE.CubeTextureLoader(loadingManager);

// Get maximum anisotropy value supported by the GPU
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
console.log(`Maximum anisotropy: ${maxAnisotropy}`);

// Load textures with anisotropic filtering
let cubeTexture1 = loader.load(map1, function(texture) {
    texture.anisotropy = maxAnisotropy;
});

let cubeTexture2 = loader.load(map2, function(texture) {
    texture.anisotropy = maxAnisotropy;
});

map1.mapping =  THREE.CubeReflectionMapping; 
map2.mapping =  THREE.CubeReflectionMapping; 

let cubeTexture = cubeTexture1;
scene.background = cubeTexture;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -0.001); 
controls.update();

const shinyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,         // White base color
    metalness: 0.8,          // Fully metallic (shiny)
    roughness: 0.2,          // Perfectly smooth surface
    // clearcoat: 1.0,          // Extra shininess (like car paint)
    // clearcoatRoughness: 0.0, // Keep clearcoat smooth
    envMap: scene.background,          // Set the environment map
    envMapIntensity: 1.5,    // Strength of reflections
  });

const geometry = new THREE.SphereGeometry(1, 64, 64);
const sphere = new THREE.Mesh(geometry, shinyMaterial);
sphere.position.set(5, -1.5, -15.2)
scene.add(sphere);

const ambient = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambient)

const ringGeometry = new THREE.CircleGeometry(0.3, 32, 0, Math.PI*2);
ringGeometry.rotateX(-Math.PI / 2);

const ringMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff9900, 
    side: THREE.DoubleSide,
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);

ring.position.set(0, -1.5, -5.2);
scene.add(ring);

function switchPosition(){
    if(flag){
        ring.position.set(0, -1.5, -5.2);
        sphere.position.set(5, -1.5, -15.2)
    }else{
        ring.position.set(0, -1.5, 5.2);
        sphere.position.set(5, -1.5, 0)
    }
}

let scale = 1;
let scaleDirection = 0.005;

let transitioning = false;
let currentMap = 1;

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObject(ring);
    
    if (intersects.length > 0 && !transitioning) {
        transitionToNewMap();
    }
}

function transitionToNewMap() {
    transitioning = true;
    flag = !flag;
    switchPosition();
    
    let opacity = 1;
    const fadeOutInterval = setInterval(() => {
        opacity -= 0.05;
        ringMaterial.opacity = opacity * 0.8;
        
        if (opacity <= 0) {
            clearInterval(fadeOutInterval);
            
            // Use preloaded textures
            if (currentMap === 1) {
                cubeTexture = cubeTexture2;
                currentMap = 2;
            } else {
                cubeTexture = cubeTexture1;
                currentMap = 1;
            }
            scene.background = cubeTexture;
            
            let newOpacity = 0;
            const fadeInInterval = setInterval(() => {
                newOpacity += 0.05;
                ringMaterial.opacity = newOpacity * 0.8;
                
                if (newOpacity >= 1) {
                    clearInterval(fadeInInterval);
                    transitioning = false;
                }
            }, 30);
        }
    }, 30);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ring);
    
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'auto';
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (!transitioning) {
        scale += scaleDirection;
        if (scale > 1.1 || scale < 0.9) {
            scaleDirection *= -1;
        }
        ring.scale.set(scale, scale, scale);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('click', onClick);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Note: animate() is now called in the loadingManager.onLoad callback
// This prevents rendering until all assets are loaded