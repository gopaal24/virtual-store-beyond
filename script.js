import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

const loader = new THREE.CubeTextureLoader();
let cubeTexture = loader.load(map1);
scene.background = cubeTexture;


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0, 0, -0.001); 
controls.update();


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
    }else{
        ring.position.set(0, -1.5, 5.2);
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
            
            
            if (currentMap === 1) {
                cubeTexture = loader.load(map2);
                currentMap = 2;
            } else {
                cubeTexture = loader.load(map1);
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

animate();