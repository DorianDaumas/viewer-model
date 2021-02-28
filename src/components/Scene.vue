<template>
<div>
  <div class="scene">
      <div id="three-scene-canvas" >
        <div id="Menu-icon" @click='toggleMenu' ><img src="../assets/settings-white-48dp.svg"></div>
          <div  v-bind:class="{ 'MenuShow' : this.menu }" class="Menu" >
            
            <div id="model-info">
              <br>
              <h1 id="title">Information sur le model </h1>
                <div id="info-label">
                  <label v-if="objectInfo" class="label-Menu">{{objectInfo.name}}</label>
                  <label class="label-Menu">Triangles: {{triangles}}</label>
                </div>
            </div>

            <p id="title">render</p>
            <label class="label-Menu"> Post-Processing
              <input type="checkbox" id="volume" name="volume" @change="postProcess" v-model="postProcessToggle" >
            </label>

            <!-- <label> vertexMode :
              <input type="checkbox" id="volume" name="volume"  @change="vertexMode" v-model="toggleVertexMode" >
              {{toggleVertexMode}}
            </label> -->

            <p id="title">geometry</p>
            <label class="label-Menu"> wireframe 
              <input type="checkbox" id="volume" name="volume" @change="toggleWireframe" v-model="toggleWireframeMode" :key='toggleWireframeMode' >
            </label>

            <p id="title">ROTATION</p>
            <label class="label-Menu"> Rotation
              <input type="checkbox" id="volume" name="volume" @change="autoRotate" v-model="rotateToggle" >
            </label>
            
            <div v-if="this.animation.animations.length !== 0">
              <p id="title">animation</p>
            <label class="label-Menu"> Animation
              <input type="checkbox" id="volume" name="volume" @change="enbledAnim" v-model="AnimToggle" >
            </label>
            </div>
            

            <p id="title">lumières</p>
            <label class="label-Menu"> Environement
              <input type="checkbox" id="volume" name="volume"  @change="envMapping" v-model="toggleEnvMap" >
            </label>

            <label class="label-Menu" style="flex-direction: column;display: flex; padding-left: 0px;">Intensité des lumières
              <input v-if="light4" type="range" id="volume" step="0.01" @input="light" name="volume" :min="minimalStep" v-model="LightIntensity" max="3">
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
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import * as POSTPROCESSING from "postprocessing";
// import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
// import { VertexTangentsHelper } from 'three/examples/jsm/helpers/VertexTangentsHelper';
// import { BufferGeometryUtils  } from 'three/examples/jsm/utils/BufferGeometryUtils';

export default {
    name: 'Scene',
    data () {
        return {
          hover: false,
            AnimToggle:true,
            sceneCanvas: null,
            scene: null,
            vnh:null,
            vth:null,
            group:null,
            camera: null,
            renderer: null,
            controls: null,
            composer:null,
            loader: false,
            postProcessToggle: true,
            toggleEnvMap:true,
            menu:true,
            rotateToggle: false,
            toggleWireframeMode: false,
            toggleVertexMode: false,
            light1:null,
            light2:null,
            light3:null,
            light4:null,
            triangles:null,
            minimalStep:1,
            LightIntensity: 1,
            mixer:null,
            action:null,
            clock: new THREE.Clock(),
        }
    },
   computed: {
        animation() {
            return this.$store.state.object.animation
        },   
        object() {
            return this.$store.state.object
        },    
        objectInfo() {
            return this.$store.state.object.objectInfo
        },
        objectMaterial() {
            return this.$store.state.object.objectMaterial
        },
        objectGeometry() {
            return this.$store.state.object.objectGeometry
        },
        


    },

     

    mounted () {
      if (this.object.object === null) {
        this.$router.push("/")
      }else{
        this.initScene()
        this.autoRotate()
        window.addEventListener('resize', () => {this.windowResize()})
        
      }
    },

    

  methods: {

    enbledAnim(){
      if (this.animation !== null) {
        this.action.paused = !this.AnimToggle       
      }
    },

    toggleMenu(){
      this.menu = !this.menu
    },

     autoRotate(){
      if (this.rotateToggle) {
        this.controls.autoRotate = true
        this.controls.autoRotateSpeed = 4
      }else{
        this.controls.autoRotate = false
      }
    },

    envMapping(){
      if (this.toggleEnvMap) {
        this.minimalStep = 0
        this.LightIntensity = 0.3
        this.light()
          new RGBELoader().setDataType( THREE.UnsignedByteType ).load( "quarry_01_1k.hdr", ( texture ) => {
          let envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          this.scene.environment = envMap  

            texture.dispose();
            pmremGenerator.dispose();
        });
        let pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
      }
      else{
        this.minimalStep = 1
        this.LightIntensity = 1
        this.light()
        this.scene.environment = null
      }
    },

    
    toggleWireframe(){
      this.objectMaterial.map( setWireframe => {
          setWireframe.wireframe = this.toggleWireframeMode
      }) 
      if (this.toggleWireframeMode) {
        this.postProcessToggle = false
      }
      else if (this.postProcessToggle){
        this.toggleWireframeMode = false
      }
      else{
        this.postProcessToggle = true
      }
      
    },

    postProcess(){
      
      if (this.postProcessToggle) {
        this.toggleWireframeMode = false
      
        this.composer = new POSTPROCESSING.EffectComposer(this.renderer);
        this.composer.addPass(new POSTPROCESSING.RenderPass(this.scene, this.camera));

        const bloomOptions = {
          blendFunction: POSTPROCESSING.BlendFunction.SCREEN,
          kernelSize: POSTPROCESSING.KernelSize.SMALL,
          luminanceThreshold: 0.60,
          luminanceSmoothing: 1,
          resolution: 480,
          height: 650
        }

        const toneMappingOptions = {
          blendFunction: POSTPROCESSING.BlendFunction.NORMAL,
          adaptive: true,
          resolution: 1024,
          middleGrey: 0.6,
          maxLuminance: 16.0,
          averageLuminance: 1.0,
          adaptationRate: 2.0
        }

        const HueOptions = {
          blendFunction: POSTPROCESSING.BlendFunction.NORMAL,
          hue: 0,
          saturation: 0.1,
        }

        const effectPass = new POSTPROCESSING.EffectPass(
          this.camera,
          new POSTPROCESSING.BloomEffect(bloomOptions),
          new POSTPROCESSING.ToneMappingEffect(toneMappingOptions),
          new POSTPROCESSING.HueSaturationEffect(HueOptions),
        );

        effectPass.renderToScreen = true;
        this.composer.addPass(effectPass);

        
      }
 
       
    },


    vertexMode(){
    },

    light(){
      this.light1.intensity = this.LightIntensity
      this.light2.intensity = this.LightIntensity
      this.light3.intensity = this.LightIntensity
      this.light4.intensity = this.LightIntensity
    },


    initScene(){

        /* **************
            BASIC SETUP
        ************** */

        let object = this.object.object
        if (this.animation.animations.length !== 0) {
          this.mixer = new THREE.AnimationMixer( object );
          this.action = this.mixer.clipAction( this.animation.animations[0] ); 
          this.action.play()
        }

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
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(sceneCanvasW, sceneCanvasH);
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.shadowMapSoft = true
        this.renderer.shadowMap.autoUpdate = false
        this.renderer.shadowMap.needsUpdate = true
        this.postProcess()
        this.sceneCanvas.append(this.renderer.domElement)        
        this.light1 = new THREE.PointLight(0xffffff,this.LightIntensity);
        this.light1.position.set(0,300,500);
        this.scene.add(this.light1);
        this.light2 = new THREE.PointLight(0xffffff,this.LightIntensity);
        this.light2.position.set(500,100,0);
        this.scene.add(this.light2);
        this.light3 = new THREE.PointLight(0xffffff,this.LightIntensity);
        this.light3.position.set(0,100,-500);
        this.scene.add(this.light3);
        this.light4 = new THREE.PointLight(0xffffff,this.LightIntensity);
        this.light4.position.set(-500,300,0);
        this.scene.add(this.light4);
        this.envMapping()
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        this.controls.reset();
        object.position.x += (object.position.x - center.x);
        object.position.y += (object.position.y - center.y);
        object.position.z += (object.position.z - center.z);
        this.controls.maxDistance = size * 15;
        this.camera.near = size / 25;
        this.camera.far = size * 25;
        this.camera.updateProjectionMatrix();
        this.camera.lookAt( new THREE.Vector3() );
        this.camera.position.copy(center);
        this.camera.position.x += size / 3.0;
        this.camera.position.y += size / 3.0;
        this.camera.position.z += size / 3.0;
        this.camera.lookAt(center);     
        this.scene.add(object);
        var result = this.objectGeometry.reduce((sum, item) => {
          if (item.geometry.index !== null) {        
            return sum = sum+item.geometry.index.count / 3;
          }
          else{
            return sum = sum+item.geometry.attributes.position.count / 3;
          }
        },0);
        
        this.triangles = result.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        this.animateThreeJs()
    },
   
    // resize
    windowResize(){
        let sceneCanvasW = this.sceneCanvas.offsetWidth 
        let sceneCanvasH = this.sceneCanvas.offsetHeight 
        this.camera.aspect = sceneCanvasW / sceneCanvasH;
        this.camera.updateProjectionMatrix()
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(sceneCanvasW, sceneCanvasH);
    },

    // animate
    animateThreeJs () {
      if ( this.vnh ) this.vnh.update();
      if ( this.vth ) this.vth.update();
      if (this.postProcessToggle) {
        requestAnimationFrame(this.animateThreeJs)
        if ( this.animation.animations.length > 0 ) this.mixer.update( this.clock.getDelta() );
        this.controls.update();
        this.composer.render(this.clock.getDelta());
      }else{
        requestAnimationFrame(this.animateThreeJs)
        if ( this.animation.animations.length  > 0 ) this.mixer.update( this.clock.getDelta() );
        this.controls.update();
        this.renderer.render(this.scene, this.camera)
        this.renderer.shadowMap.needsUpdate = true
      }
    },
  }
}

</script>

<style scoped >
#Menu-icon{
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  transition: 0.5s;
}
#Menu-icon:hover{
  transform: rotate(90deg);
}

.label-Menu{
  display: flex;
    height: 32px;
    padding: 4px;
    margin: 4px 0;
    font-size: 13px;
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
  background: linear-gradient(270deg, rgba(49,49,49,1) 0%, rgb(140 177 206) 0%, rgb(49 49 49) 100%);
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
  opacity: 0.9;
  align-items: baseline;
  justify-content: space-evenly;
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
