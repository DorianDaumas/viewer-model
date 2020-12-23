<template>
  <div id="flex">
    <h1 class="ERROR">{{this.error}}</h1>
    <div v-if="xhr === null" class="file-wrapper">
      <label id="label1" for="file">Faites glisser ici un fichier objet 3D (.glb ou .fbx)</label>
        <input style="padding: 200px;    opacity: 0;" type="file" id="file" name="file" ref="file" v-on:change="handleFileUpload()"/>
        <label id="label1" style="top: 45%" for="file">OU</label>
      <label id="label1" style="top: 55%" for="file">Un fichier sprite 2D (.png ou .jpg)</label>
      <label id="label2">( Si vous avez un dossier avec .gltf / .bin / textures <a id="link" target="_blank" href="https://glb-packer.glitch.me/">convertissez </a> 
      vos assets puis vous pourrez glisser votre fichier .glb dans cette application )</label>
      <br>
     
    </div>
    
    <div v-else>
      <div class="lds-ripple"><div></div><div></div></div>
    </div>


  </div>
</template>

<script>
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
// import * as THREE from 'three'

export default {
  name: 'Home',
  data() {
    return {
      file:null,
      object:null,
      xhr:null,
      error:null,
      envMap:null
    }
  },

  methods: {
  
    handleFileUpload(){
      // console.log(this.$refs.file.files,"t//his.$refs.file.files")
      // this.file = this.$refs.file.files
      //  for (let i = 0; i < this.file.length; i++) {
      //   this.test = URL.createObjectURL(this.file[i])
      // }
      this.file = this.$refs.file.files[0];
      const loaderGLTF = new GLTFLoader();
      const loaderFBX = new FBXLoader();
      let objectURL = URL.createObjectURL(this.file);
      let objectInfo = this.file


      if (this.file.name.match(/\.(GLB|glb)$/)) {
        loaderGLTF.load(objectURL, ( gltf ) => {
        let object = gltf
        let allMaterial = []
        let objectGeometry = []
          gltf.scene.traverse( ( object ) => {
            if ( object.isMesh ) {
              allMaterial.push(object.material)
              
              objectGeometry.push(object)
            }
          })
          let loadedGLTF = gltf.scene
          this.$store.commit('object/OBJECT_ANIMATION', object )
          this.$store.commit('object/OBJECT_MATERIAL', allMaterial )
          this.$store.commit('object/OBJECT_GEOMETRY', objectGeometry )
          this.$store.commit('object/OBJECT_SCENE', loadedGLTF )
          this.$store.commit('object/OBJECT_INFO', objectInfo )
          this.$router.push('/Scene')
        },( xhr ) => {
          this.xhr = ( xhr.loaded / xhr.total * 100 ) + '% charger'
        },( e ) => {
          console.log(e,"e")
          // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        })
      }

      else if (this.file.name.match(/\.(png|jpg|PNG|JPG)$/)) {
          console.log(objectURL,"this.file")
          this.$store.commit('object/OBJECT_URL', objectURL )
          this.$router.push('/Scene2d')
      }

      else if (this.file.name.match(/\.(fbx|FBX)$/)) {
        loaderFBX.load(objectURL, ( fbx ) => {
          let object = fbx
          let allMaterial = []
          let objectGeometry = []
          fbx.traverse( ( object ) => {
            if ( object.isMesh ) {
              allMaterial.push(object.material)

              objectGeometry.push(object)
            }
          })

          let loadedFBX = fbx
          this.$store.commit('object/OBJECT_ANIMATION', object )
          this.$store.commit('object/OBJECT_MATERIAL', allMaterial )
          this.$store.commit('object/OBJECT_GEOMETRY', objectGeometry )
          this.$store.commit('object/OBJECT_SCENE', loadedFBX )
          this.$store.commit('object/OBJECT_INFO', objectInfo )
          this.$router.push('/Scene')
        },( xhr ) => {
          this.xhr = ( xhr.loaded / xhr.total * 100 ) + '% charger'
        },( onError ) => {
          console.log(onError,"e")
        })
        
      }  
      else{
        this.file = null
         this.error = "Le fichier que vous avez envoyé n'est pas un fichier .glb ou .fbx"
      }

          
    }
    

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.file-wrapper{
  // padding: 230px;
  display: flex;
    background: #ffffff;
    justify-content: center;
    border: dashed 1px #4CAF50;
  align-items: center;
}

#link{
      color: #4CAF50;
    text-decoration: underline;
    font-size: 1em;
    text-transform: uppercase;
}
#label1{
font-size: 20pt;
    color: #cccccc;
    position: absolute;
    display: flex;
    top: 35%;
    // flex-direction: column;
    align-items: center;
    justify-content: center;
}

#label2{
    font-size: 10pt;
    color: #ffffff;
    position: absolute;
    top: 0;
    width: 100%;
    background: #232323;
    padding: 15px;
}
.ERROR{
  color: #ffffff;
  position: absolute;
    top: 20px;
}
#flex{
    display: flex;
    justify-content: center;
    flex-direction: column;
    height: 100vh;
    align-items: center;
    background: #ffffff;
}

.lds-ripple {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  background: #ffffff;
}
.lds-ripple div {
  position: absolute;
  border: 4px solid #202124;
  opacity: 1;
  padding: 25px;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}

</style>
