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

    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 20, friction: 0.3, restitution: 0.3 }, scene);

    return box;
}

function createGround(scene) {
    const ground = BABYLON.MeshBuilder.CreateBox("Ground", {width: 1000, height: 1, depth: 1000}, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    
    ground.position.y = 0;
    groundMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    groundMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    groundMat.backFaceCulling = false;
    ground.material = groundMat;
    ground.receiveShadows = true;

    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.5 }, scene);
}

function createJengaTower(scene, shadowGenerator) {
    const objects = [];
    
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
            objects.push(rectangle);
        }
    }
    
    return objects;
}

// CreateScene function that creates and return the scene
function createScene (canvas) {
    const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 2, 50, BABYLON.Vector3.Zero(), scene);
    const light = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(0.2, -1, 0), scene);
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    
    scene.enablePhysics(null, new BABYLON.AmmoJSPlugin());
    scene.clearColor = BABYLON.Color3.Purple();
    
    camera.setPosition(new BABYLON.Vector3(0, 30, 30))
    camera.attachControl(canvas, true);

    light.position = new BABYLON.Vector3(0, 80, 0);

    createGround(scene);

    const jengaObjects = createJengaTower(scene, shadowGenerator);

    // camera.target = jengaObjects[jengaObjects.length/2];

    return {
        camera,
        engine,
        scene
    };
}

// call the createScene function
const canvas = document.getElementById('renderCanvas');
var { camera, engine, scene } = createScene(canvas);

// run the render loop
engine.runRenderLoop(function() {
    scene.render();
});

// the canvas/window resize event handler
window.addEventListener("resize", function() {
    engine.resize();
});

window.addEventListener("pointerdown", function() {
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
    pickInfo.pickedMesh.physicsImpostor.setMass(0);
});