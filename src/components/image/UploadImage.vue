<template>
   <v-card flat class="edit-profile pl-3">
      <v-card-title v-if="!bypassTitle">Upload Image</v-card-title>
      <v-row>
         <v-col v-if="showImage">
            <v-img :src="fileUrl" width="200"/>
         </v-col>
         <v-col>
            <input id="fileInput" type="file" @change="handleFileChange"/>
            <v-card-text>
               <div>{{ uploadStatus }}</div>
            </v-card-text>
         </v-col>
      </v-row>
       <v-card-actions class="justify-end">
         <v-btn color="primary" @click="upload()" :disabled="!dataValid">Upload</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { storage } from '@/firebase'
   import { ref as storageRef } from 'firebase/storage'
   import { uploadBytesResumable, getDownloadURL } from 'firebase/storage'
   import { useUserStore } from '@/stores/userStore'
   import { useImageMgr }  from '@/stores/image/imageMgr'  
   import { Emit }  from '@/utils/constants'

   const props = defineProps({ uploadHandler: Object, uploadContext: Object, bypassTitle:Boolean })
   const emit  = defineEmits([ Emit.DONE ])

   const userStore = useUserStore()
   const imageMgr  = useImageMgr()
   const itemFile = ref('')
   const fileUrl = ref('')
   const uploadStatus = ref('')

   const showImage = computed(() => dataValid.value)
   const dataValid = computed(() => fileUrl.value.length ? true : false)

   const handleFileChange = (e) => {
      itemFile.value = e.target.files[0]
      fileUrl.value = URL.createObjectURL(itemFile.value)
   }

   const upload = () => {
      const imageSet = imageMgr.createImageSet(props.uploadContext.uploadImageType, userStore.userId)
      const imageRef = storageRef(storage, imageSet.filePath)

      let img = new Image()
      img.onload = () => { imageSet.dimensions = { width: img.width, height: img.height } }
      img.src = fileUrl.value

      const uploadTask = uploadBytesResumable(imageRef, itemFile.value, { contentType: itemFile.value.type })
      uploadTask.on('state_changed',
         (snapshot) => {
            const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            uploadStatus.value = 'Upload ' + progress + '% done'
         },
         (error) => {
            console.log("Upload failed", error)
            emit(Emit.DONE)
         },
         () => {
            // successful upload
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
               imageSet.url = downloadURL
               imageSet.thumbUrl = downloadURL
               imageSet.largeThumbUrl = downloadURL

               props.uploadHandler.addImageSet(imageSet, props.uploadContext)
               imageMgr.waitForThumbUrls(imageSet, props.uploadHandler, props.uploadContext)
               emit(Emit.DONE)
            })
         }
      )
   }
</script>

<style>
</style>
