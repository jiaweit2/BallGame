import * as THREE from 'libs/three.js'
import * as OIMO from 'libs/oimo.min.js'
import 'libs/weapp-adapter.js'
//data
var data = {
  ontouch: false,
  strength: 0,
  ori_pos: new THREE.Vector3(0, -2, -5),
  ori_pos_wall: new THREE.Vector3(0, 1, -20)
};


// setup
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.z = 30;
camera.position.y = 30;
camera.rotation.x = -30 * Math.PI / 180;
var context = canvas.getContext('webgl');
var renderer = new THREE.WebGLRenderer(context);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
var world = new OIMO.World({
  timestep: 1 / 30,
  iterations: 8,
  broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
  worldscale: 1, // scale full world 
  random: true,  // randomize sample
  info: false,   // calculate statistic or not
  gravity: [0, -9.8, 0]
});
// const loader = new THREE.JSONLoader();
// loader.load('/res/bin.json', (geometry, materials) => {
//   const bear = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
//   scene.add(bear);
// });

var ambientlight = new THREE.AmbientLight(0xffffff, 0.5, 0, 2);
scene.add(ambientlight);
var pointlight = new THREE.PointLight(0xffffff, 0.5, 0, 2);
scene.add(pointlight);

//mesh - the BALL!
var geometry = new THREE.SphereGeometry(.6, 64, 64);
var material = new THREE.MeshLambertMaterial({
  transparent: true,
  opacity: 1,
  color: 0xffffff
});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
//model - the ball
var body = world.add({
  type: 'sphere', // type of shape : sphere, box, cylinder 
  size: [0.6], // size of shape
  pos: [0, -2, -5], // start position in degree
  rot: [0, 0, 0], // start rotation in degree
  move: true, // dynamic or statique
  density: 1,
  friction: 0.2,
  restitution: 0.2,
  belongsTo: 1, // The bits of the collision groups to which the shape belongs.
  collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
});

//model3 - invisible
var ground2 = world.add({
  type: 'box', // type of shape : sphere, box, cylinder 
  size: [3, .1, 3], // size of shape
  pos: [0, -2.1, -5], // start position in degree
  rot: [0, 0, 0], // start rotation in degree
  move: false, // dynamic or statique
  density: 1,
  friction: 0.2,
  restitution: 0.2,
  belongsTo: 1, // The bits of the collision groups to which the shape belongs.
  collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
});

var wall_mesh = [];
var ground_mesh = [];
var ground = [];
var wall = [];

function add_wall(z){
      //mesh2
      var geometry = new THREE.BoxGeometry(6, 1, 4);
      var material = new THREE.MeshLambertMaterial({
        transparent: true,
        opacity: 1,
        color: 0xFFB7B3
      });
      var ground_mesh_elem = new THREE.Mesh(geometry, material);
      ground_mesh.push(ground_mesh_elem);
      scene.add(ground_mesh_elem);

      //mesh3 - wall
      var geometry = new THREE.BoxGeometry(5, 5, 0.5);
      var material = new THREE.MeshLambertMaterial({
        transparent: true,
        opacity: 1,
        color: 0xCAEFFF
      });
      var wall_mesh_elem = new THREE.Mesh(geometry, material);
      wall_mesh_elem.position.y = 1;
      wall_mesh.push(wall_mesh_elem);
      scene.add(wall_mesh_elem);

      //model2 - ground far
      var ground_elem = world.add({
        type: 'box', // type of shape : sphere, box, cylinder 
        size: [6, 1, 4], // size of shape
        pos: [0, -2.5, z], // start position in degree
        rot: [0, 0, 0], // start rotation in degree
        move: false, // dynamic or statique
        density: 1,
        friction: 0.2,
        restitution: 0,
        belongsTo: 1, // The bits of the collision groups to which the shape belongs.
        collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
      });
      ground.push(ground_elem);

      //model4 - wall
      var wall_elem = world.add({
        type: 'box', // type of shape : sphere, box, cylinder 
        size: [5, 5, 0.5], // size of shape
        pos: [0, 0.53, z], // start position in degree
        rot: [0, 0, 0], // start rotation in degree
        move: true, // dynamic or statique
        density: 0.2,
        friction: 0.2,
        restitution: 0.2,
        belongsTo: 1, // The bits of the collision groups to which the shape belongs.
        collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
      });
      wall.push(wall_elem);
}

for(var i=0;i<20;i++){
  add_wall(-20-i*2);
}

function reset() {
  body.resetPosition(data.ori_pos.x, data.ori_pos.y, data.ori_pos.z);
  data.strength = 0;
}
function reset_wall() {
  wall.resetPosition(data.ori_pos_wall.x, data.ori_pos_wall.y, data.ori_pos_wall.z);
  wall.resetQuaternion(0, 0, 0);
}

function render() {
  //update
  world.step();
  for(var i=0;i<wall.length;i++){
    wall_mesh[i].position.copy(wall[i].getPosition());
    wall_mesh[i].quaternion.copy(wall[i].getQuaternion());
    ground_mesh[i].position.copy(ground[i].getPosition());
    ground_mesh[i].quaternion.copy(ground[i].getQuaternion());
  }
  cube.position.copy(body.getPosition());
  cube.quaternion.copy(body.getQuaternion());
  if (data.ontouch) {
    data.strength += 0.2;
  }
  if (cube.position.y < -20) {
    reset();
  }
  // if (wall.position.y < -15) {
  //   reset_wall();
  // }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
//control
wx.onTouchMove(function (e) {
  // move on screen
});
wx.onTouchStart(function (e) {
  data.ontouch = true;
});
wx.onTouchEnd(function (e) {
  data.ontouch = false;
  if (data.strength > 13)
    data.strength = 13;
  if (data.strength < 9)
    data.strength = 9;
  body.linearVelocity.y = data.strength * 0.9;
  body.linearVelocity.z = -data.strength * 1.05;
});
