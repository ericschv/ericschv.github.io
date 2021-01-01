// Find the latest version by visiting https://unpkg.com/three. The URL will
// redirect to the newest stable release.
import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "https://unpkg.com/three/examples/jsm/controls/DragControls.js";

function initCamera() {
    const fov = 50;
    const aspect = window.innerWidth / window.innerHeight
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    camera.position.set(0, 25, 25);
    
    return camera;
}

function initOrbitControls(renderer, camera) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 10, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = 1.5;
    
    controls.mouseButtons = {
        RIGHT: THREE.MOUSE.ROTATE,
    }

    controls.update();
}

function createFloor(scene) {
    const geometry = new THREE.PlaneGeometry(25, 25, 30);
    const texture = new THREE.TextureLoader().load("textures/wood_table.jpg");
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: texture });
    const plane = new THREE.Mesh(geometry, material);

    plane.rotation.x = 7.854;
    plane.position.y = 0.49;

    scene.add(plane);
}

function createRectangle(scene, xRotation, yRotation, zRotation, xPosition, yPosition, zPosition) {
    const boxWidth = 1.5;
    const boxHeight = 1;
    const boxDepth = 5;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const texture1 = new THREE.TextureLoader().load("textures/wood.jpg");
    const texture2 = new THREE.TextureLoader().load("textures/wood_side.jpg");
    const materials = [
        new THREE.MeshPhongMaterial({ color: 0xDDDDDD, map: texture1 }),
        new THREE.MeshPhongMaterial({ color: 0xDDDDDD, map: texture1 }),
        new THREE.MeshPhongMaterial({ color: 0xDDDDDD, map: texture1 }),
        new THREE.MeshPhongMaterial({ color: 0xDDDDDD, map: texture1 }),
        new THREE.MeshPhongMaterial({ color: 0xDDDDDD, map: texture2 }),
        new THREE.MeshPhongMaterial({ color: 0xDDDDDD, map: texture2 }),
    ]
    const rectangle = new THREE.Mesh(geometry, materials);
    
    rectangle.name = "rectangle";
    rectangle.rotation.x = xRotation;
    rectangle.rotation.y = yRotation;
    rectangle.rotation.z = zRotation;
    rectangle.position.x = xPosition;
    rectangle.position.y = yPosition;
    rectangle.position.z = zPosition;

    scene.add(rectangle);

    return rectangle;
}

function initDragControls(objects, camera, renderer) {
    const dragControl = new DragControls(objects, camera, renderer.domElement);
    let selectedJengaObjectPositionY;

    dragControl.addEventListener("dragstart", function(e) {
        selectedJengaObjectPositionY = e.object.position.y;
    });

    dragControl.addEventListener("drag", function(e) {
        e.object.position.y = selectedJengaObjectPositionY;
    });

    // Disable object drag on right click.
    // This will allow you to rotate the camera when the mouse
    // is hovering over a draggable object.
    renderer.domElement.addEventListener("pointerdown", function(e) {
        if (e.button === 0) {
            dragControl.enabled = true;
        }

        if (e.button === 2) {
            dragControl.enabled = false;
        }
    });
}

function initAnimation(renderer, camera, scene) {
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();
}

function main() {
    const renderer = new THREE.WebGLRenderer();
    const scene = new THREE.Scene();
    const skyLight = new THREE.HemisphereLight(0xFFFFFF, 0x080820, 1.2);
    const camera = initCamera();
    const objects = [];

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0xFFFFFF);
    scene.add(skyLight);
    
    createFloor(scene);
    
    for(let i = 1; i <= 18; i++) {
        const yRotation = i % 2 === 0 ? 1.57 : 0;
        const yPosition = i;
    
        for(let n = 1.75; n >= -1.75; n -= 1.75) {
            const xPosition = i % 2 === 0 ? 0 : n;
            const zPosition = i % 2 === 0 ? n : 0;
            
            objects.push(createRectangle(scene, 0, yRotation, 0, xPosition, yPosition, zPosition));
        }
    }

    initOrbitControls(renderer, camera);

    initDragControls(objects, camera, renderer);

    initAnimation(renderer, camera, scene);
}
    
main();
