var jengaGame = (function(){

	"use strict";
	
	Physijs.scripts.worker = 'physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';

	var scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 }),
	renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer({antialias: true}) : new THREE.CanvasRenderer(),
    amb_light, //Hao
    dir_light, //Hao
	camera,
	backgroundscene = new THREE.Scene(), //background scene(image) //Hao
	backgroundCamera = new THREE.Camera(),//background cam //Hao
	physics_stats,
	controls, // mouse control
	table, // playing surface for jenga //Hao
	rectangle, // jenga object type
	tower, // jenga tower i.e. total sum of jenga pieces
	blocks = [],
	posx = -13, // inital horizontal position of jenga pieces
	loader = new THREE.TextureLoader(),
	raycaster = new THREE.Raycaster(),
	intersect_plane,
	selected_block = null, 
	mouse_position = new THREE.Vector3, 
	block_offset = new THREE.Vector3,
	_vector = new THREE.Vector3,
	handleMouseDown, 
	handleMouseMove, 
	handleMouseUp,
	_i, 
	_v3 = new THREE.Vector3;

	function initScene(){

		physics_stats = new Stats();
		physics_stats.domElement.style.position = 'absolute';
		physics_stats.domElement.style.top = '50px';
		physics_stats.domElement.style.zIndex = 100;
		document.getElementById( 'jenga-container' ).appendChild( physics_stats.domElement );

		scene.setGravity(new THREE.Vector3(0,-50,0));
		scene.addEventListener(
			'update',
			function() {
				if ( selected_block !== null ) {
					
					_v3.copy( mouse_position ).add( block_offset ).sub( selected_block.position ).multiplyScalar( 5 );
					_v3.y = 0;
					selected_block.setLinearVelocity( _v3 );
					
					// Reactivate all of the blocks
					_v3.set( 0, 0, 0 );
					for ( _i = 0; _i < blocks.length; _i++ ) {
						blocks[_i].applyCentralImpulse( _v3 );
					}
				}
				scene.simulate( undefined, 1 );
				physics_stats.update();
			}
		);

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;//enable shadow //Hao
        renderer.shadowMapSoft = true; //Hao
		document.getElementById("jenga-container").appendChild(renderer.domElement);

		camera = new THREE.PerspectiveCamera(
			40,
			window.innerWidth/window.innerHeight,
			1,
			1000
			);

		
		camera.position.set( 115, 75, 115 );
		camera.lookAt(new THREE.Vector3( 0, 35, 0 ));
        scene.add(camera);
        // ambient light
		amb_light = new THREE.AmbientLight( 0x444444 );
		scene.add( amb_light );

        // directional light
		dir_light = new THREE.DirectionalLight( 0xFFFFFF  );
		dir_light.position.set( 100, 100, -20 );
        dir_light.target.position.copy( scene.position );
        dir_light.castShadow = true;
        dir_light.shadowCameraLeft = -300;
		dir_light.shadowCameraTop = -300;
		dir_light.shadowCameraRight = 300;
		dir_light.shadowCameraBottom = 300;
		dir_light.shadowCameraNear = 20;
		dir_light.shadowCameraFar = 500;
		dir_light.shadowBias = -.001;
		dir_light.shadowMapWidth = dir_light.shadowMapHeight = 2048;
		dir_light.shadowDarkness = 0.5;

        scene.add(dir_light );
		
		var tableTexture = Physijs.createMaterial(
				new THREE.MeshLambertMaterial({map: loader.load('texture/wood7.jpg')}),
				.9,
				.2
			);
	         
	 	table = new Physijs.BoxMesh(
	 		new THREE.BoxGeometry(160, 1, 150, 5, 5, 5),
	 		tableTexture,
	 		0, // mass
	 		{ restitution: .2, friction: .8}
	 	);

        table.receiveShadow = true;//jenga shadow
	          
	  	table.name = "table"; 

	  	table.position.y = -3; // table position in relation to jenga tower
	  	
	 	scene.add(table);
		

	 	
		for(var i=0; i<16; i++)
		{
			for(var j=0; j<3; j++)
			{
				tower = jengaPiece();
				tower.position.x = posx;
				posx += 10; // increases horizontal distance between jenga pieces
				tower.position.y += 5*i; // increases vertical distance between jenga pieces

				if(i%2 === 0)
				{
					tower.rotation.x = 0; // resets horizontal position
					tower.rotation.y = 0; // resets vertical position
					rectangle.rotation.z = Math.PI/2; //rotates jenga pieces 90 degrees
					tower.position.x = -3;
					tower.translateZ(10*j);
					tower.position.z -= 10;
				}

				tower.castShadow = true; //Hao
				tower.receiveShadow = true; //Hao
				scene.add(tower);
				blocks.push(tower);

			}

			tower.name = "jenga";
			
			posx = -13;
		}

		//plane allows the dragging of jenga blocks
		intersect_plane = new THREE.Mesh(
			new THREE.PlaneGeometry( 150, 150 ),
			new THREE.MeshBasicMaterial({ opacity: 0, transparent: true })
		);
		intersect_plane.rotation.x = Math.PI / -2;
		scene.add( intersect_plane );

		
		//background texture
        var bkgMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2, 0),
            new THREE.MeshBasicMaterial({
            	map: loader.load('texture/background.jpg')
            }));
        bkgMesh .material.depthTest = false;
        //Whether to have depth test enabled when rendering this material. Default is true.
        bkgMesh .material.depthWrite = false;
        //Whether rendering this material has any effect on the depth buffer. Default is true.
        //When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together //without creating z-index artifacts.
        backgroundscene.add(backgroundCamera);
        //backgroundscene.add(bkgMesh);
		
        backgroundscene.background = new THREE.Color( #eaeaea ),
						     
        render();
	}
		
	function jengaPiece(){

		var blockTexture = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load('texture/wood7.jpg')}),
			.4, // medium friction
			.4 // medium resitution
		);

		rectangle = new Physijs.BoxMesh(
			new THREE.BoxGeometry(5,28,8),
			blockTexture //Physijs material
		);

		rectangle.rotation.x = Math.PI/2;
		rectangle.rotation.y = Math.PI/2;
		rectangle.castShadow = true; //Hao
		rectangle.receiveShadow = true; //Hao

		return rectangle;
	}

	handleMouseDown = function( evt ) {
			var ray, intersections;
			
			_vector.set(
				( evt.clientX / window.innerWidth ) * 2 - 1,
				-( evt.clientY / window.innerHeight ) * 2 + 1,
				1
			);
			_vector.unproject( camera );
			
			ray = new THREE.Raycaster( camera.position, _vector.sub( camera.position ).normalize() );
			intersections = ray.intersectObjects( blocks );
			if ( intersections.length > 0 ) {
				selected_block = intersections[0].object;
				
				_vector.set( 0, 0, 0 );
				selected_block.setAngularFactor( _vector );
				selected_block.setAngularVelocity( _vector );
				selected_block.setLinearFactor( _vector );
				selected_block.setLinearVelocity( _vector );
				mouse_position.copy( intersections[0].point );
				block_offset.subVectors( selected_block.position, mouse_position );
				
				intersect_plane.position.y = mouse_position.y;
			}
		};
		
		handleMouseMove = function( evt ) {
			
			var ray, intersection,
				i, scalar;
			
			if ( selected_block !== null ) {
				
				_vector.set(
					( evt.clientX / window.innerWidth ) * 2 - 1,
					-( evt.clientY / window.innerHeight ) * 2 + 1,
					1
				);
				_vector.unproject( camera );
				
				ray = new THREE.Raycaster( camera.position, _vector.sub( camera.position ).normalize() );
				intersection = ray.intersectObject( intersect_plane );
				mouse_position.copy( intersection[0].point );
			}
			
		};
		
		handleMouseUp = function( evt ) {
			
			if ( selected_block !== null ) {
				_vector.set( 1, 1, 1 );
				selected_block.setAngularFactor( _vector );
				selected_block.setLinearFactor( _vector );
				
				selected_block = null;
			}
			
		};

	function render(){

		
		renderer.autoClear = false;//efines whether the renderer should automatically clear its output before rendering.
        renderer.clear();
  		renderer.render(backgroundscene, backgroundCamera);
		

		scene.simulate(); // starts the physijs physics engine

		requestAnimationFrame(render);
		renderer.render(scene, camera);

		renderer.domElement.addEventListener( 'mousedown', handleMouseDown );
		renderer.domElement.addEventListener( 'mousemove', handleMouseMove );
		renderer.domElement.addEventListener( 'mouseup', handleMouseUp );
	}

	window.onload = initScene;

	return {
		scene: scene
	}

})();
