import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
const _ = require('lodash');

//camera build placement
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
camera.position.set(25, 25, 100);
camera.lookAt(new THREE.Vector3(25, 25, -50));

//Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

//Window
export function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

//Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

//Add directional light
let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(-30, 50, -30);
scene.add(dirLight);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -70;
dirLight.shadow.camera.right = 70;
dirLight.shadow.camera.top = 70;
dirLight.shadow.camera.bottom = -70;

//controlling
//const controls = new OrbitControls(camera, renderer.domElement);
function keyUpHandler(event, obj) {
  //event.which;

  _.pullAll(keyArr, [event.which]);

  console.log(keyArr);
}
const mouse = new THREE.Vector2();
let xSpeed = 0.5;
let ySpeed = 0.5;
let keyArr = [];
function keyDownHandler(event, obj) {
  console.log(`Keypress ${event.which}`);

  //console.log(obj.position);
  if (!keyArr.includes(event.which)) {
    keyArr.push(event.which);
  }

  console.log(keyArr);

  //playerOne
  playerOne.position.y += ySpeed * keyArr.includes(87);
  playerOne.position.y -= ySpeed * keyArr.includes(83);
  playerOne.position.x -= xSpeed * keyArr.includes(65);
  playerOne.position.x += xSpeed * keyArr.includes(68);
  //PlayerTwo
  playerTwo.position.y += ySpeed * keyArr.includes(73);
  playerTwo.position.y -= ySpeed * keyArr.includes(75);
  playerTwo.position.x -= xSpeed * keyArr.includes(74);
  playerTwo.position.x += xSpeed * keyArr.includes(76);
}

function handleClick(intersect) {
  console.log(intersect);
  //get the UUID's of the object clicked on
  let uuid = intersect.object.uuid;

  //when clicking a cube move it to random place
  //loop through boxArr to find the matching object. and do somethign to it.
  boxArr.forEach((ele) => {
    if (ele.box.uuid == uuid) {
      //set new destination for object
      ele.destination = { y: Math.floor(Math.random() * 50), x: Math.floor(Math.random() * 50) };

      //stop all tweeening currently running for the object.
      TWEEN.remove(ele.tween1);
      TWEEN.remove(ele.tween2);
      TWEEN.remove(ele.tween3);
      TWEEN.remove(ele.tween4);
      TWEEN.remove(ele.tween5);
      TWEEN.remove(ele.tween6);

      //restart tweening with new destination set
      doThrob(ele);
    }
  });
}

//raycaster
const raycaster = new THREE.Raycaster();
renderer.domElement.addEventListener('click', raycast, false);
function raycast(e) {
  //1. sets the mouse position with a coordinate system where the center
  //   of the screen is the origin
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  //2. set the picking ray from the camera position and mouse coordinates
  raycaster.setFromCamera(mouse, camera);

  //3. compute intersections
  var intersects = raycaster.intersectObjects(scene.children);

  for (var i = 0; i < intersects.length; i++) {
    //do something when an intersect is detected
    handleClick(intersects[i]);

    /*dsa
          An intersection has the following properties :
              - object : intersected object (THREE.Mesh)
              - distance : distance from camera to intersection (number)
              - face : intersected face (THREE.Face3)
              - faceIndex : intersected face index (number)
              - point : intersection point (THREE.Vector3)
              - uv : intersection point in the object's UV coordinates (THREE.Vector2)
      */
  }
}

// ambient light
let hemiLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(hemiLight);

function animate() {
  TWEEN.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// function createBox(position) {
//   let box = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({ color: 0xdc143c }));
//   box.position.x = position.x;
//   box.position.y = position.y;
//   box.position.z = position.z;
//   console.log(box.position);
//   box.scale.set(6, 6, 6);
//   box.castShadow = true;
//   box.receiveShadow = true;

//   scene.add(box);

//   var start = { x: 3, y: 3, z: 3 };
//   var target1 = { x: 4, y: 4, z: 4 };
//   var target2 = { x: 3, y: 3, z: 3 };
//   var tween1 = new TWEEN.Tween(start).to(target1, 2000).easing(TWEEN.Easing.Elastic.InOut);
//   var tween2 = new TWEEN.Tween(start).to(target2, 2000).easing(TWEEN.Easing.Elastic.InOut).chain(tween1);
//   tween1.chain(tween2);
//   tween1.start();

//   const update = function () {
//     box.scale.x = start.x;
//     box.scale.y = start.y;
//     box.scale.z = start.z;
//   };

//   tween1.onUpdate(update);
//   tween2.onUpdate(update);
// }

//using a global array to keep track of spawned classes temporarily
let boxArr = [];

class SpawnMovableBox {
  constructor(position, destination, throb) {
    boxArr.push(this);

    if (!destination) {
      console.log(`randomDestination`);
      this.destination = {};
      this.destination.x = Math.floor(Math.random() * 50);
      this.destination.y = Math.floor(Math.random() * 50);
    } else {
      this.destination = destination;
    }

    if (!position) {
      this.position = {};
      this.position.x = Math.floor(Math.random() * 50);
      this.position.y = Math.floor(Math.random() * 50);
    } else {
      this.position = position;
    }

    //console.log(this);
    //make the box
    this.box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(),
      new THREE.MeshPhongMaterial({ color: 0xdc143c })
    );
    this.box.position.set(this.position.x, this.position.y, 0);
    this.box.scale.set(6, 6, 6);
    this.box.castShadow = true;
    this.box.receiveShadow = true;

    document.addEventListener('keydown', (e) => keyDownHandler(e, this), false);
    document.addEventListener('keyup', (e) => keyUpHandler(e, this), false);

    scene.add(this.box);
    setTimeout(doThrob(this), 1000);
    console.log(this);
  }
}

class SpawnRandomBox {
  constructor(position, destination, throb) {
    boxArr.push(this);

    if (!destination) {
      console.log(`Random destination`);
      this.destination = {};
      this.destination.x = Math.floor(Math.random() * 50);
      this.destination.y = Math.floor(Math.random() * 50);
    } else {
      this.destination = destination;
    }

    if (!position) {
      console.log(`Random position`);
      this.position = {};
      this.position.x = Math.floor(Math.random() * 50);
      this.position.y = Math.floor(Math.random() * 50);
    } else {
      this.position = position;
    }

    //console.log(this);
    //make the box
    this.box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(),
      new THREE.MeshPhongMaterial({ color: 0xdc143c })
    );
    this.box.position.set(this.position.x, this.position.y, 0);
    this.box.scale.set(6, 6, 6);
    this.box.castShadow = true;
    this.box.receiveShadow = true;

    scene.add(this.box);
    setTimeout(doThrob(this), 1000);

    //remove after 10 seconds
    // setTimeout(() => {
    //   console.log('removing');
    //   boxArr.shift();
    //   console.log(boxArr);
    //   scene.remove(this.box);
    // }, 30000);
  }
}

//tweening throbbing function. Pass in an object to have it smoothly move from its position to its destination, And throb
function doThrob(obj) {
  //tweening start and targets

  let tweenStart = { x: 3, y: 3, z: 3 };
  let tweenTarget1 = { x: 3.3, y: 3.3, z: 3.3 };
  let tweenTarget2 = { x: 3, y: 3, z: 3 };
  let positionStart = obj.position;
  let positionTarget = obj.destination;
  let rotationStart = obj.box.rotation;
  let rotationTarget = { x: 0, y: -0.02, z: -0.05 };

  let rotationTarget2 = { x: 0, y: -0.02, z: 0.05 };
  let rotationTarget3 = { x: 0, y: 0, z: 0 };
  //console.log(rotationStart.x);

  let update = function () {
    //console.log(obj);
    //console.log(tweenStart);
    obj.box.scale.x = tweenStart.x;
    obj.box.scale.y = tweenStart.y;
    obj.box.scale.z = tweenStart.z;
    obj.box.position.x = obj.position.x;
    obj.box.position.y = obj.position.y;
    obj.box.rotation.x = rotationStart.x;
    obj.box.rotation.y = rotationStart.y;
  };

  obj.tween1 = new TWEEN.Tween(tweenStart)
    .to(tweenTarget1, 1000)
    .easing(TWEEN.Easing.Quadratic.InOut);
  obj.tween2 = new TWEEN.Tween(tweenStart)
    .to(tweenTarget2, 3000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .chain(obj.tween1)
    .delay(0);
  obj.tween3 = new TWEEN.Tween(positionStart)
    .to(positionTarget, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut);
  obj.tween4 = new TWEEN.Tween(rotationStart)
    .to(rotationTarget, 3000)
    .easing(TWEEN.Easing.Quadratic.InOut);
  obj.tween6 = new TWEEN.Tween(rotationStart)
    .to(rotationTarget3, 3000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .chain(obj.tween4);
  obj.tween5 = new TWEEN.Tween(rotationStart)
    .to(rotationTarget2, 3000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .chain(obj.tween6);

  obj.tween4.chain(obj.tween5);
  obj.tween1.chain(obj.tween2);
  obj.tween1.onUpdate(update);
  obj.tween2.onUpdate(update);
  obj.tween3.onUpdate(update);
  obj.tween4.onUpdate(update);
  obj.tween5.onUpdate(update);
  obj.tween6.onUpdate(update);
  obj.tween1.start();
  obj.tween3.start();
  obj.tween4.start();
}

//spawn some test cubes

let playerOne = new SpawnMovableBox();
let playerTwo = new SpawnMovableBox();

// setTimeout(() => {
//   let randomBox = new SpawnRandomBox();
// }, 2000);

//AI
let AI = new SpawnMovableBox();
//just randomly move the AI object around every 2
function ai() {
  setInterval(() => {
    let uuid = AI.box.uuid;
    console.log('i am a robot, moving to new position');
    AI.destination = { y: Math.floor(Math.random() * 50), x: Math.floor(Math.random() * 50) };

    //stop all tweeening currently running for the object.
    TWEEN.remove(AI.tween1);
    TWEEN.remove(AI.tween2);
    TWEEN.remove(AI.tween3);
    TWEEN.remove(AI.tween4);
    TWEEN.remove(AI.tween5);
    TWEEN.remove(AI.tween6);

    //restart tweening with new destination set
    doThrob(AI);
  }, 2000);
}

//Inits
animate();
ai();
