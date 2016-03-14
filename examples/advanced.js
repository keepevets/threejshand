(function() {
  // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};
  var controller, cursor, initScene, riggedHand, stats;

  window.scene = null;

  window.renderer = null;

  window.camera = null;
  var max_rotate = 0;
  var object_grip = false;
  var rotate_direction = 1;
  var onProgress = function ( xhr ) {
          // if ( xhr.lengthComputable ) {
          //   var percentComplete = xhr.loaded / xhr.total * 100;
          //   console.log( Math.round(percentComplete, 2) + '% downloaded' );
          // }
        };

  var onError = function ( xhr ) {
        };
  initScene = function(element) {
    var axis, pointLight;
    window.scene = new THREE.Scene();
    window.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    // renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element.appendChild(renderer.domElement);
    axis = new THREE.AxisHelper(40);
    // scene.add(axis);
    //scene.add(new THREE.AmbientLight(0xffffff));
    pointLight = new THREE.PointLight(0xFFffff);
    pointLight.position = new THREE.Vector3(20, 10, 20);
    pointLight.lookAt(new THREE.Vector3(0, 0, 0));
    // scene.add(pointLight);
     var light1 = new THREE.PointLight(0xeeeeee);
  light1.position.set(300,500,700);
  scene.add(light1);
    window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.fromArray([0, 900, 900]);
    camera.lookAt(new THREE.Vector3(0, 600, 900));
    window.controls = new THREE.TrackballControls(camera);
    // scene.addx(camera);
            var light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set( -200, 200, -200 ).normalize();
        // light.target.position.set( 0, 0, 0 );
        scene.add( light );
    var loader = new THREE.OBJMTLLoader();
    loader.load( 'pen_6.obj', 'pen.mtl', function ( object ) {
      carobject = object;
      carobject.traverse( function ( child ) {
          //     if (child.geometry != undefined)
          //     {
          //       console.log('normals compute');
          //     child.geometry.computeVertexNormals(true);
          //     child.geometry.computeFaceNormals();
          //     }
            var scale = 3;
            child.scale.set(scale, scale, scale);
      });

      carobject.rotation.y =0;//1.5708;//-3.14/2;
      carobject.rotation.x =0;
      // carobject.rotation.z =50;
      // object.position.y = 80;
      scene.add( carobject );

    }, onProgress, onError );
    window.addEventListener('resize', function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      controls.handleResize();
      return renderer.render(scene, camera);
    }, false);
    return renderer.render(scene, camera);
  };

  // via Detector.js:
var webglAvailable  = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();

  if (webglAvailable) {
    initScene(document.body);
  }

  // stats = new Stats();

  // stats.domElement.style.position = 'absolute';

  // stats.domElement.style.left = '0px';

  // stats.domElement.style.top = '0px';

  // document.body.appendChild(stats.domElement);

  window.controller = controller = new Leap.Controller;
  var grabbed = false;
  controller.use('handHold').use('transform', {
    position: new THREE.Vector3(1, 0, 0)
  }).use('handEntry').use('screenPosition').use('riggedHand', {
    parent: scene,
    renderer: renderer,
    scale: getParam('scale'),
    positionScale: getParam('positionScale'),
    helper: false,
    offset: new THREE.Vector3(0, 0, 0),
    renderFn: function() {
      renderer.render(scene, camera);
      return controls.update();
    },
    materialOptions: {
      wireframe: getParam('wireframe')
    },
    dotsMode: getParam('dots'),
    stats: stats,
    camera: camera,
    boneLabels: function(boneMesh, leapHand) {

      if (rotate_direction == 1)
      {
        boneMesh.rotation.x += .06;
        
        max_rotate += .06;
      } else {
        boneMesh.rotation.x -= .06;
        max_rotate -= .06;
      }
      console.log(leapHand.palmPosition[1])
      if (leapHand.pinchStrength > .6 && (carobject.position.y + 120 > leapHand.palmPosition[1]) && (leapHand.palmPosition[1] > carobject.position.y - 100))
      {
        carobject.position.x = leapHand.palmPosition[0];//-20;
        carobject.position.y = leapHand.palmPosition[1]-(30*boneMesh.rotation.x);//-30;
        carobject.position.z = leapHand.palmPosition[2];//-25;
      
        carobject.rotation.z = leapHand.roll();
        carobject.rotation.x = leapHand.pitch();
        carobject.rotation.y = -1*leapHand.yaw();
        object_grip = true;
      } else {
        object_grip = false;
      }
      
      // carobject.rotation.y = boneMesh.rotation.y;// + 3.14;// + leapHand.roll();
      if (max_rotate >= 4)
      {
        rotate_direction = -1;
      } else if (max_rotate <= -4) {
        rotate_direction = 1;
      }
     
    },
    boneColors: function(boneMesh, leapHand) {
      // if ((boneMesh.name.indexOf('Finger_0') === 0) || (boneMesh.name.indexOf('Finger_1') === 0)) {
      //   return {
      //     hue: 0.6,
      //     saturation: leapHand.pinchStrength
      //   };
      // }
    },
    checkWebGL: true
  }).connect();

  if (getParam('screenPosition')) {
    cursor = document.createElement('div');
    cursor.style.width = '50px';
    cursor.style.height = '50px';
    cursor.style.position = 'absolute';
    cursor.style.zIndex = '10';
    cursor.style.backgroundColor = 'green';
    cursor.style.opacity = '0.8';
    cursor.style.color = 'white';
    cursor.style.fontFamily = 'curior';
    cursor.style.textAlign = 'center';
    cursor.innerHTML = "&lt;div&gt;";
    document.body.appendChild(cursor);
    controller.on('frame', function(frame) {
      var hand, handMesh, screenPosition;
      if (hand = frame.hands[0]) {
        handMesh = frame.hands[0].data('riggedHand.mesh');
        screenPosition = handMesh.screenPosition(hand.fingers[1].tipPosition, camera);
        cursor.style.left = screenPosition.x;
        return cursor.style.bottom = screenPosition.y;
      }
    });
  }

controller.on('frame', function(frame) {
  
       if (typeof carobject !== 'undefined' && (object_grip == false || frame.hands[0] == undefined) && carobject.position.y > 0) {
        carobject.position.y = carobject.position.y - 9.8;
      }
});

  if (getParam('scenePosition')) {
    window.sphere = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial(0x0000ff));
    scene.add(sphere);
    controller.on('frame', function(frame) {
      var hand, handMesh;
      if (hand = frame.hands[0]) {
        handMesh = frame.hands[0].data('riggedHand.mesh');
        return handMesh.scenePosition(hand.indexFinger.tipPosition, sphere.position);
      }

    });
  }

  if (getParam('playback')) {
    controller.use('playback', {
      recording: 'examples/confidence2-49fps.json.lz',
      autoPlay: true,
      pauseOnHand: true
    });
  }

  if (getParam('boneHand')) {
    riggedHand = controller.plugins.riggedHand;
    controller.use('boneHand', {
      renderer: riggedHand.renderer,
      scene: riggedHand.parent,
      camera: riggedHand.camera,
      render: function() {}
    });
  }

}).call(this);
