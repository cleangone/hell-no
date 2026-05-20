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
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useActionStore }  from '@/stores/actionStore'
   import { Emit, ImageType } from '@/utils/constants'
   import 'vue-advanced-cropper/dist/style.css'

   const props = defineProps({ item:Object, itemImageToCrop:Object, cropImageType:String })    
   const emit  = defineEmits([Emit.DONE])

   const itemStore   = useItemStore()
   const itemMgr     = useItemMgr()
   const actionStore = useActionStore()
   const cropperElement = ref(null)
   const cropCoordinates = ref(null)
   const cropActiveCanvas = ref(null)

   const urlToCrop   = computed(() => props.itemImageToCrop ? props.itemImageToCrop.url + "&random=" + Math.random() : "")
   const contentType = computed(() => props.cropImageType == ImageType.USER ? "image/png" : "image/jpeg")

   const onCropChange = ({ coordinates, canvas }) => { 
      cropCoordinates.value = coordinates 
      cropActiveCanvas.value = canvas 
   }

   const crop = () => {
      console.log("crop", contentType.value)
      const result = cropperElement.value.getResult()
      const croppedUrl = result.canvas.toDataURL(contentType.value)
      
      const croppedItemImage = itemMgr.createItemImage(props.cropImageType, props.item.userId)
      actionStore.addImageAction(props.item.id, props.item.userId, croppedItemImage)
      croppedItemImage.dimensions = { width: cropCoordinates.value.width, height: cropCoordinates.value.height }      
                    
      const imageRef = storageRef(storage, croppedItemImage.filePath)
      fetch(croppedUrl).then(result => {
         // console.log("getting blob")
         return result.blob()
      }).then(blob => {
         // console.log("uploading blob", contentType.value)
         uploadBytes(imageRef, blob, { contentType: contentType.value }).then(function(snapshot) {
            // console.log("getting downloadURL", snapshot)
            return getDownloadURL(snapshot.ref)
         }).then(downloadURL => {
            // console.log("Cropped downloadURL", props.item.id, downloadURL); 
            croppedItemImage.url = downloadURL
            croppedItemImage.thumbUrl = downloadURL // for initial image display, will be overwritten
            
            // possible race condition with thumb processing finishing before item updated?
            // backend propagates appropriate images to gallery/user
            itemStore.addCroppedImage(props.item.id, croppedItemImage)  // initial add for image display
            emit(Emit.DONE)
         }) 
      }).catch(error => {
         console.error(error)
         emit(Emit.DONE)
      })
   }

   // cannot get this to work - image stored as png but does not have invisible corners
   // handling the circle in the display

   const cropCircle = () => {
      // const result = cropperElement.value.getResult()
      console.log("cropCircle", contentType.value)
      
      const croppedItemImage = itemMgr.createItemImage(props.cropImageType, props.item.userId)
      actionStore.addImageAction(props.item.id, props.item.userId, croppedItemImage)
      croppedItemImage.dimensions = { width: cropCoordinates.value.width, height: cropCoordinates.value.height }      
                    
      const imageRef = storageRef(storage, croppedItemImage.filePath)
       //const croppedUrl = cropActiveCanvas.value.toDataURL(contentType.value)
      new Promise(resolve => cropActiveCanvas.value.toBlob(resolve, 'image/png'))
      .then(blob => {
         console.log("uploading circle blob", contentType.value)
         uploadBytes(imageRef, blob, { contentType: contentType.value }).then(function(snapshot) {
            console.log("getting circle downloadURL", snapshot)
            return getDownloadURL(snapshot.ref)
         }).then(downloadURL => {
            console.log("Cropped circle downloadURL", props.item.id, downloadURL); 
            croppedItemImage.url = downloadURL
            croppedItemImage.thumbUrl = downloadURL // for initial image display, will be overwritten
            
            // possible race condition with thumb processing finishing before item updated?
            itemStore.addCroppedImage(props.item.id, croppedItemImage)  // initial add for image display
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