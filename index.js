const JENGA_OBJECT_MASS = 10;

function createRectangle(scene, xRotation, yRotation, zRotation, xPosition, yPosition, zPosition) {
    const box = BABYLON.MeshBuilder.CreateBox(
        "Box",
        {
            height: 1,
            width: 2,
            depth: 7
        },
        scene
    );
    const materialWood = new BABYLON.StandardMaterial("wood", scene);
    
    materialWood.diffuseTexture = new BABYLON.Texture("textures/wood.jpg", scene);
    materialWood.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    box.position = new BABYLON.Vector3(xPosition, yPosition, zPosition);
    box.rotation = new BABYLON.Vector3(xRotation, yRotation, zRotation);
    box.material = materialWood;
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: JENGA_OBJECT_MASS, friction: 0.5, restitution: 0.3 }, scene);

    return box;
}

function createGround(scene) {
    const ground = BABYLON.MeshBuilder.CreateBox("Ground", {width: 1000, height: 1, depth: 1000}, scene);
    const material = new BABYLON.StandardMaterial("groundMat", scene);
    
    ground.position.y = 0;
    material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    material.backFaceCulling = false;
    ground.material = material;
    ground.receiveShadows = true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 1, restitution: 0.5 }, scene);
}

function createJengaTower(scene, shadowGenerator) {
    for(let i = 1; i <= 18; i++) {
        const yRotation = i % 2 === 0 ? 1.57 : 0;
        const yPosition = i;
        
        for(let n = -2.5; n <= 2.5; n += 2.5) {
            const xPosition = i % 2 === 0 ? 0 : n;
            const zPosition = i % 2 === 0 ? n : 0;
            
            const pointerDragBehavior = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0, 1, 0)});
            const rectangle = createRectangle(scene, 0, yRotation, 0, xPosition, yPosition, zPosition);
            shadowGenerator.addShadowCaster(rectangle);
            rectangle.addBehavior(pointerDragBehavior);
        }
    }
}

// CreateScene function that creates and return the scene
function createScene () {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 2, 50, BABYLON.Vector3.Zero(), scene);
    const light = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(0.2, -1, 0), scene);
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    
    scene.enablePhysics(null, new BABYLON.AmmoJSPlugin());
    scene.clearColor = BABYLON.Color3.Purple();
    
    camera.setPosition(new BABYLON.Vector3(0, 40, 40))
    camera.attachControl(canvas, true);
    
    light.position = new BABYLON.Vector3(0, 80, 0);
    
    createGround(scene);
    
    createJengaTower(scene, shadowGenerator);

    return {
        engine,
        scene
    };
}

let pickedJengaObject;
const { engine, scene } = createScene();

engine.runRenderLoop(function() {
    scene.render();
});

window.addEventListener("resize", function() {
    engine.resize();
});

// Set the mass of the jenga block to zero so that it
// doesn't fall as you drag it.
window.addEventListener("pointerdown", function() {
    pickedJengaObject = scene.pick(scene.pointerX, scene.pointerY);

    if (pickedJengaObject.pickedMesh.name === "Box") {
        pickedJengaObject.pickedMesh.physicsImpostor.setMass(0);
    }
});

// Reset the mass of the jenga block when you let go of it.
window.addEventListener("pointerup", function() {
    if (pickedJengaObject.pickedMesh.name === "Box") {
        pickedJengaObject.pickedMesh.physicsImpostor.setMass(JENGA_OBJECT_MASS);
    }
})