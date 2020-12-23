<template>
  <div class="scene">
    <div id="three-scene-canvas">
        <div style="margin-left: 180px;position: absolute;" id="model-info">
            <h1 id="title">Information sur le model </h1>
            <img id="imgInfo" :src="objectUrl">
        </div>
        
        <div id="Menu-icon" @click='toggleMenu' ><img id="settingsAnim" src="../assets/settings-white-48dp.svg"></div>
        
        <div v-bind:class="{ 'MenuShow' : this.menu }" class="Menu" >
              
            <div id="model-info">
            <p id="title">Background</p>
            <label class="label-Menu"> black 
              <input type="checkbox" id="volume" name="volume" @change="toggleBackground" v-model="background" :key='background' >
            </label>


            <p id="title">Réglage</p>
            <label class="label-Menu" style="flex-direction: column;display: flex; padding-left: 0px;">Vitesse d'animation
                <input type="range" id="volume" step="1" @input="reRenderSprite" name="volume" min="1" v-model="speed" max="20">
            </label>

            <label class="label-Menu" style="flex-direction: column;display: flex; padding-left: 0px;">Nombre d'image horizontal ({{hCount}})
                <input type="range" id="volume" step="1" @input="reRenderSprite" name="volume" min="1" v-model="hCount" max="20">
            </label>

            <label class="label-Menu" ><router-link style="color: white;margin: 40px 0px 0px 22px;" to="/">Import new model</router-link></label>

            <br><br><br>
            </div>
        </div>
  </div>

  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { NodeMaterialLoader, NodeMaterialLoaderUtils } from 'three/examples/jsm/loaders/NodeMaterialLoader.js';
import {
    NodeFrame,
    SpriteNodeMaterial,
    MathNode,
    OperatorNode,
    TextureNode,
    Vector2Node,
    TimerNode,
    UVNode
} from 'three/examples/jsm/nodes/Nodes.js';
// import * as dat from 'dat.gui';

export default {
  name: 'Scene',
  data () {
    return {
      sceneCanvas: null,
      scene: null,
      camera: null,
      renderer: null,
      menu:true,
      controls: null,
      sprite1:null,
      walkingManTexture:null,
      walkingManTextureURL:null,
      library:{},
      clock: new THREE.Clock(),
      frame: new NodeFrame(),
      hCount:8,
      speed:10,
      background: true,
    }
  },
  mounted () {
      if (this.objectUrl === null) {
        this.$router.push("/")
      }else{
        this.initScene()
        window.addEventListener('resize', () => {this.windowResize()})
      }
  },

  computed: {
        objectUrl() {
            return this.$store.state.object.objectURL
        },
  },

  methods: {

    toggleBackground(){
        if (this.background) {
            this.sceneCanvas.style.background = "black"
        }else{
            this.sceneCanvas.style.background = "white"
        }
    },
    
    toggleMenu(){
      this.menu = !this.menu
    },

    initScene(){
      /* **************
        BASIC SETUP
      ************** */
      this.sceneCanvas = document.getElementById('three-scene-canvas')
      let sceneCanvasW = this.sceneCanvas.offsetWidth 
      let sceneCanvasH = this.sceneCanvas.offsetHeight 
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,0.1,1000)
      this.camera.position.set(15, 5, 15)
      this.camera.aspect = sceneCanvasW / sceneCanvasH;
      
      // render
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      })
      this.renderer.outputEncoding = THREE.sRGBEncoding
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    //   this.renderer.setClearColor(transparent)
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize(sceneCanvasW, sceneCanvasH);
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer.shadowMapSoft = true
      this.renderer.shadowMap.autoUpdate = false
      this.renderer.shadowMap.needsUpdate = true
      this.sceneCanvas.append(this.renderer.domElement)
      
      // light
      let ambientLight = new THREE.AmbientLight (0xdaccff, 0.5)
      this.scene.add(ambientLight)
      let light = new THREE.PointLight(0xfc831d, 1, 100)
      light.position.set(15, 10, 15)
      light.castShadow = true
      light.shadow.radius = 1
      light.shadow.mapSize.width = 2048
      light.shadow.mapSize.height = 2048
      this.scene.add(light)

    this.walkingManTextureURL = this.objectUrl;

    this.walkingManTexture = new THREE.TextureLoader().load( this.walkingManTextureURL );
    this.walkingManTexture.wrapS = this.walkingManTexture.wrapT = THREE.RepeatWrapping;

    this.library[this.walkingManTextureURL] = this.walkingManTexture;

    const spriteWidth = 10, spriteHeight = 10;

    this.scene.add( this.sprite1 = new THREE.Sprite( new SpriteNodeMaterial() ) );
    this.sprite1.scale.x = spriteWidth;
    this.sprite1.scale.y = spriteHeight;
    this.sprite1.material.color = new TextureNode( this.walkingManTexture );
    this.sprite1.material.color.uv = this.createHorizontalSpriteSheetNode(this.speed, this.hCount);
    this.sprite1.material.needsUpdate = true;

    const box = new THREE.Box3().setFromObject(this.sprite1);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    this.controls.reset();

    this.sprite1.position.x += (this.sprite1.position.x - center.x);
    this.sprite1.position.y += (this.sprite1.position.y - center.y);
    this.sprite1.position.z += (this.sprite1.position.z - center.z);


    this.controls.maxDistance = size * 15;
    this.camera.near = size / 25;
    this.camera.far = size * 25;
    this.camera.updateProjectionMatrix();


    this.camera.lookAt( new THREE.Vector3() );

    this.camera.position.copy(center);
    this.camera.position.x += size / 1.0;
    this.camera.position.y += size / 1.0;
    this.camera.position.z += size / 1.0;

    this.camera.lookAt(center);

    this.spriteToJSON();

    this.animateThreeJs()
    },

    reRenderSprite(){
        this.sprite1.material.color.uv = this.createHorizontalSpriteSheetNode(this.speed, this.hCount);
    },

    createHorizontalSpriteSheetNode(speed,hCount) {
        speed = this.speed
        hCount = this.hCount

        const speedNode = new Vector2Node( speed, 0 ); // frame per second
        const scale = new Vector2Node( 1 / hCount, 1 ); // 8 horizontal images in sprite-sheet
        
        const uvTimer = new OperatorNode(
            new TimerNode(),
            speedNode,
            OperatorNode.MUL
        );

        const uvIntegerTimer = new MathNode(
            uvTimer,
            MathNode.FLOOR
        );

        const uvFrameOffset = new OperatorNode(
            uvIntegerTimer,
            scale,
            OperatorNode.MUL
        );

        const uvScale = new OperatorNode(
            new UVNode(),
            scale,
            OperatorNode.MUL
        );

        const uvFrame = new OperatorNode(
            uvScale,
            uvFrameOffset,
            OperatorNode.ADD
        );

        return uvFrame;

    },

    
    spriteToJSON() {

        const json = this.sprite1.material.toJSON();

        NodeMaterialLoaderUtils.replaceUUID( json, this.walkingManTexture, this.walkingManTextureURL );

        const material = new NodeMaterialLoader( null, this.library ).parse( json );

        this.sprite1.material.dispose();

        this.sprite1.material = material;

    },
    
    // resize
    windowResize(){
        let sceneCanvasW = this.sceneCanvas.offsetWidth 
        let sceneCanvasH = this.sceneCanvas.offsetHeight 
        this.camera.aspect = sceneCanvasW / sceneCanvasH;
        this.camera.updateProjectionMatrix()
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(sceneCanvasW, sceneCanvasH);

        // this.camera.aspect = window.innerWidth / window.innerHeight;
        // this.camera.updateProjectionMatrix()
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    // animate
    animateThreeJs () {
        const delta = this.clock.getDelta();
        this.frame.update( delta ).updateNode( this.sprite1.material )
        requestAnimationFrame(this.animateThreeJs)
        this.controls.update();
        this.renderer.render(this.scene, this.camera)
        this.renderer.shadowMap.needsUpdate = true
        this.sprite1.material.needsUpdate = true;
    },
  }
}
</script>

<style scoped>
#Menu-icon{
    position: absolute;
    top: 20px;
    right: 0px;
    cursor: pointer;
    transition: 0.5s;
    background: black;
    padding: 13px;
}
#settingsAnim{
  transition: 0.5s;
}
#settingsAnim:hover{
  transform: rotate(90deg);
}

#imgInfo{
    width: 640px;
}

.label-Menu{
  display: flex;
    height: 32px;
    padding: 4px;
    margin: 4px 0;
    font-size: 9px;
    cursor: pointer;
    border-radius: 3px;
    opacity: .75;
    align-items: center;
}
#title{
  display: block;
  margin: 18px 4px 4px;
  text-align: left;
  font-size: 10px;
  font-weight: 400;
  color: #888;
  text-transform: uppercase;
}
.scene{
  display: flex;
  align-items: center;
  margin: 50px;
  justify-content: center;
  flex-direction: column;
  outline: none!important;
  background: #ffffff;
  border: none!important;
  height: 100%;
}
canvas{
  width: 100%!important;
  height: 100%!important;
  outline: none!important; border: none!important;
}

#info-label label{
  font-size: 12px!important;
}

#info-label{
  flex-direction: column;
  display: flex;
}

#model-info{
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
  flex-direction: column;
  text-transform: uppercase;
  border-bottom: 1px solid #a5a5a5;
}


@media screen and (max-width: 600px) {
  #three-scene-canvas {
    width: 500px!important;
    height: 500px!important;
  }
}
#three-scene-canvas {
  width: 900px;
    position: relative;
  /* background: radial-gradient(circle, rgba(49,49,49,1) 0%, rgb(97 114 121) 50%, rgb(49 49 49) 100%); */
  background: black;
  height: 500px;
  overflow: hidden;
  cursor: grab;
  outline: none!important; border: none!important;
}
.Menu{
  display: flex;
  flex-direction: column;
  background: #313131;
  color: white;
  align-items: baseline;
  position: absolute;
  width: 195px;
  transform: translate(-195px);
  top: 0px;
  height: 100%;
  transition: 0.3s;
}
.MenuShow{
  display: flex;
  flex-direction: column;
  background: #191919;
  color: white;
  align-items: baseline;
  justify-content: flex-start;
  position: absolute;
  padding-left: 15px;
  padding-top: 10px;
  overflow: auto;
  width: 165px;
  transform: translate(0px);
  top: 0px;
  height: 100%;
  transition: 0.3s;
}
.MenuShow:hover{
  cursor: pointer;
}
#three-scene-canvas:active{
  cursor: grabbing;
}
</style>