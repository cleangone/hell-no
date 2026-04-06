<template>
   <v-card title="Bulk Upload" class="upload-dialog">
      <v-container>
         <v-row>
            <v-col v-if="filesExist" class="text-center">
               <v-img :src="fileUrl" width="200"/>
               <div > {{ fileName  }}</div>
               <TextButton v-if="filesExist" @click="removeFile()" text="Remove from upload"></TextButton>
            </v-col>
            <v-col>
               <input multiple @change="handleFileChange" type="file" id="fileInput" />
               <div v-if="filesExist" class="mt-10"> 
                  {{ uploadFiles.length }} {{ uploadFiles.length > 1 ? "Files" : "File" }} to upload
               </div>
               <div v-if="filesExist" >
                  <TextButton @click="prev()" text="Prev" :disabled="!prevFileExists" ></TextButton>
                  <TextButton @click="next()" text="Next" :disabled="!nextFileExists"></TextButton>
               </div>
               <v-card-text>
                  <div>{{ uploadFilename }}</div>
                  <div>{{ uploadStatus }}</div>
               </v-card-text>
            </v-col>
         </v-row>
      </v-container>
      
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="uploadAllFiles()" :disabled="!filesExist">Upload files</v-btn>
         <v-btn color="primary" @click="$emit('done')">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { storage } from '@/firebase'
   import { ref as storageRef } from 'firebase/storage'
   import { uploadBytesResumable, getDownloadURL } from 'firebase/storage'
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import TextButton from '@/components/util/TextButton.vue'
   import { dateUuid } from '@/utils/utils'
   import { Emit, ImageType, ItemType, State } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object, userId: String })
   const emit  = defineEmits([ Emit.DONE ])
   const userStore    = useUserStore()
   const itemStore    = useItemStore()   
   const itemMgr      = useItemMgr()
   const galleryStore = useGalleryStore()
   const uploadFilename  = ref('')
   const uploadStatus    = ref('')
   const uploadFileIndex = ref(0)
   const uploadFiles = ref([])

   const userId = computed(() => props.userId ? props.userId : userStore.userId)
   
   const handleFileChange = (e) => {
      uploadFileIndex.value = 0
      uploadFiles.value = []
      for (const file of e.target.files) {
         const filename = file.name.lastIndexOf(".") ? file.name.substring(0, file.name.lastIndexOf(".")) : file.name
         uploadFiles.value.push( { file: file, filename: filename, url: URL.createObjectURL(file) })
      }
   }
   
   const fileUrl        = computed(() => { return uploadFiles.value[uploadFileIndex.value].url })
   const fileName       = computed(() => { return uploadFiles.value[uploadFileIndex.value].filename })
   const filesExist     = computed(() => { return uploadFiles.value.length ? true : false })
   const prevFileExists = computed(() => { return uploadFileIndex.value > 0 })
   const nextFileExists = computed(() => { return uploadFileIndex.value < uploadFiles.value.length-1 })
   
   const prev = () => { uploadFileIndex.value-- }
   const next = () => { uploadFileIndex.value++ }

   const removeFile = () => { 
      uploadFiles.value.splice(uploadFileIndex.value, 1)
      if (uploadFileIndex.value == uploadFiles.value.length) { uploadFileIndex.value-- }
   }

   // upload files synchronously so people can have fun watching the pct numbers
   const uploadAllFiles = async () => {
      const uploadContainers = []
      for (const [index, uploadFile] of uploadFiles.value.entries()) {
         uploadFileIndex.value = index // show file in being uploaded
         
         const item = { id: dateUuid(), primaryImage: createItemImage(uploadFile) }
         const uploadContainer = { uploadFile: uploadFile, item: item }
         await uploadSingleFile(uploadContainer)
         uploadContainers.push(uploadContainer)
      }

      setTimeout(function() { 
         for (const uploadContainer of uploadContainers) { 
            getThumbUrls(uploadContainer) 
         }
      }, 10000)

      
      emit(Emit.DONE)
   }

   // returns promise for async upload/getDownloadURL
   const uploadSingleFile = async (uploadContainer) => {
      // console.log("uploadSingleFile", uploadContainer)
      const imageRef = storageRef(storage, uploadContainer.item.primaryImage.filePath)
      const uploadTask = uploadBytesResumable(
         imageRef, uploadContainer.uploadFile.file, { contentType: uploadContainer.uploadFile.file.type })

      const promise = new Promise((resolve, reject) => {
         uploadTask.on('state_changed',
            (snapshot) => {
               // note: method returns syncronously before message can be displayed
               const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
               uploadFilename.value = uploadContainer.uploadFile.filename 
               uploadStatus.value = progress + "%"
            },
            (error) => {
               console.log("Upload failed", error)
               reject(error)
            },
            () => {
               // successful upload
               getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  uploadContainer.item.primaryImage.url = downloadURL
                  // console.log("Adding item", uploadFile.filename, downloadURL)
                  const galleryIds = props.gallery ? [props.gallery.id] : []
                  const newItem = { 
                     id: uploadContainer.item.id,
                     name: uploadContainer.uploadFile.filename,
                     userId: userId.value,
                     galleryIds: galleryIds,
                     primaryImage:  uploadContainer.item.primaryImage,
                     type: ItemType.SINGLE,
                     state: State.PRIVATE,
                  }
                  // console.log("uploadSingleFile", newItem)
                  itemStore.setItem(newItem)

                  if (props.gallery) {
                     // add new item at front of gallery
                     const itemIds = [newItem.id]
                     if (props.gallery.itemIds ) { itemIds.push(...props.gallery.itemIds) }
                        galleryStore.updateGallery({
                           id:  props.gallery.id,
                           itemIds: itemIds,
                        })
                  }

                  resolve() // resolve promise
               })
            }
         )
      })

      return promise
   }

   const createItemImage = (uploadFile) => {
      const itemImage = itemMgr.createItemImage(ImageType.PRIMARY, userId.value)
      
      let img = new Image()
      img.onload = () => { itemImage.dimensions = { width: img.width, height: img.height } }
      img.src = uploadFile.url
   
      return itemImage
   }

   const getThumbUrls = (uploadContainer) => {
      // console.log("getThumbUrls", uploadContainer.item.id)
      getDownloadURL(storageRef(storage, uploadContainer.item.primaryImage.thumbFilePath)).then((thumbDownloadURL) => {
         // console.log("thumbDownloadURL", thumbDownloadURL)
         uploadContainer.item.primaryImage.thumbUrl = thumbDownloadURL
         itemStore.updateItem(uploadContainer.item)
      })
      getDownloadURL(storageRef(storage, uploadContainer.item.primaryImage.largeThumbFilePath)).then((largeThumbDownloadURL) => {
         // console.log("largeThumbDownloadURL", largeThumbDownloadURL)
         uploadContainer.item.primaryImage.largeThumbUrl = largeThumbDownloadURL
         itemStore.updateItem(uploadContainer.item)
      })
   }
</script>

<style>

.upload-dialog {
   min-width: 500px;  
   min-height: 400px;  
}

</style>
