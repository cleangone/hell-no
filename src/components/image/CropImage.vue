<template>
   <div>
      <v-form>
         <cropper v-if="cropImageType == ImageType.GALLERY" ref="cropperElement" :src="urlToCrop" @change="onCropChange"
            :stencil-props="{aspectRatio: 16/9}" class="image-cropper"/>
         <cropper v-else-if="cropImageType == ImageType.USER" ref="cropperElement" :src="urlToCrop" @change="onCropChange"
            :stencil-component="CircleStencil" class="image-cropper"/>
         <cropper v-else ref="cropperElement" :src="urlToCrop" @change="onCropChange" class="image-cropper"/>
      </v-form>
      <div class="card-actions">  <!-- float at bottom -->
         <v-btn @click="crop(item)"       color="primary" variant="text" class="mr-4 bg-white">crop</v-btn>
         <v-btn @click="$emit(Emit.DONE)" color="primary" variant="text" class="bg-white">cancel</v-btn>
      </div>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { storage } from '@/firebase'
   import { ref as storageRef } from 'firebase/storage'
   import { uploadBytes, getDownloadURL } from 'firebase/storage'
   import { Cropper, CircleStencil } from 'vue-advanced-cropper'
   import { useUserStore } from '@/stores/userStore'
   import { useImageMgr }  from '@/stores/image/imageMgr'
   import { Emit, ImageType } from '@/utils/constants'
   import 'vue-advanced-cropper/dist/style.css'

   // context  contains item:Object, profileId:Object, or nothing if it is a user upload
   const props = defineProps({ imageToCrop:Object, cropImageType:String, uploadHandler: Object, uploadContext: Object })    
   const emit  = defineEmits([Emit.DONE])

   const userStore = useUserStore()
   const imageMgr  = useImageMgr()
   const cropperElement = ref(null)
   const cropCoordinates = ref(null)
   const cropActiveCanvas = ref(null)

   const urlToCrop   = computed(() => props.imageToCrop ? props.imageToCrop.url + "&random=" + Math.random() : "")
   const contentType = computed(() => props.cropImageType == ImageType.USER ? "image/png" : "image/jpeg")

   const onCropChange = ({ coordinates, canvas }) => { 
      cropCoordinates.value = coordinates 
      cropActiveCanvas.value = canvas 
   }
 
   // cannot get cropper to generate a circular image - supposed to turn activeCanvas into a blob
   // and upload with png type, but that does not wrok - image still a square
   // handling the circle in the display
   const crop = () => {
      console.log("crop", contentType.value)
      const result = cropperElement.value.getResult()
      const croppedUrl = result.canvas.toDataURL(contentType.value)
      
      const croppedImageSet = imageMgr.createImageSet(props.cropImageType, userStore.userId)
      croppedImageSet.dimensions = { width: cropCoordinates.value.width, height: cropCoordinates.value.height }      
                    
      const imageRef = storageRef(storage, croppedImageSet.filePath)
      fetch(croppedUrl).then(result => {
         // console.log("getting blob")
         return result.blob()
      }).then(blob => {
         // console.log("uploading blob", contentType.value)
         uploadBytes(imageRef, blob, { contentType: contentType.value }).then(function(snapshot) {
            // console.log("getting downloadURL", snapshot)
            return getDownloadURL(snapshot.ref)
         }).then(downloadURL => {
            croppedImageSet.url = downloadURL
            croppedImageSet.thumbUrl = downloadURL      // for initial display, will be overwritten
            croppedImageSet.largeThumbUrl = downloadURL // for initial display, will be overwritten
            
            props.uploadHandler.addImageSet(croppedImageSet, props.uploadContext)
            imageMgr.waitForThumbUrls(croppedImageSet, props.uploadHandler, props.uploadContext)
            emit(Emit.DONE)
         }) 
      }).catch(error => {
         console.error(error)
         emit(Emit.DONE)
      })
   }
</script>

<style>
.image-cropper {
  border: solid 1px #EEE;
  min-height: 300px;
  width: 100%;
}
</style>