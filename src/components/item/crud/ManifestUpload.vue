<template>
   <v-card title="Manifest Upload" class="upload-dialog">
      <v-container>
         <v-row>
            <v-col v-if="filesExist" class="text-center">
               <v-img :src="fileUrl" width="200"/>
               <div> {{ fileName  }}</div>
               <TextButton v-if="filesExist" @click="removeFile()" text="Remove from upload"></TextButton>
            </v-col>
            <v-col>
               <div class="mb-3">
                  <v-btn  @click="openManifest()" flat class="artist-sm-btn">
                     Open Manifest
                  </v-btn>
                  {{ manifestFileName }}   
                  <div v-if="unknownManifestArtists">
                     <div class="artist-title">Unknown Artists</div>
                     <v-row v-for="artist in unknownManifestArtists" :key="artist"  no-gutters dense>
                        <v-col class="ml-10">{{ artist }}</v-col>
                        <v-col><TextButton @click="addArtist(artist)" text="Add"/></v-col>
                     </v-row> 
                  </div>              
               </div>

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
   import { useFileDialog } from '@vueuse/core'
   import { storage } from '@/firebase'
   import { ref as storageRef } from 'firebase/storage'
   import { uploadBytesResumable, getDownloadURL } from 'firebase/storage'
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useArtistMgr }    from '@/stores/artistMgr'
   import TextButton from '@/components/util/TextButton.vue'
   import { dateUuid } from '@/utils/utils'
   import { Emit, ImageType, ItemType, State } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object, userId: String })
   const emit  = defineEmits([ Emit.DONE ])
   
   const { open:openManifest, onChange:onManifestChange } = useFileDialog({ accept: 'text/*',  multiple: false })
   const userStore    = useUserStore()
   const itemStore    = useItemStore()   
   const itemMgr      = useItemMgr()
   const galleryStore = useGalleryStore()
   const artistMgr    = useArtistMgr()
   const uploadFilename  = ref('')
   const uploadStatus    = ref('')
   const uploadFileIndex = ref(0)
   const manifestFileName = ref('')
   const manifestContents = ref('')
   const uploadFiles = ref([])
   const manifestArtistToArtist = new Map()

   const userId = computed(() => props.userId ? props.userId : userStore.userId)
   
   // manifest file upload
   onManifestChange((selectedFiles) => {
      if (!selectedFiles || selectedFiles.length === 0) return

      const file = selectedFiles[0]
      manifestFileName.value = file.name
         
      const reader = new FileReader()
      reader.onload = (e) => { manifestContents.value = e.target.result }
      reader.readAsText(file) // text/json
   })

   // image file upload
   const handleFileChange = (e) => {
      uploadFileIndex.value = 0
      uploadFiles.value = []
      for (const file of e.target.files) {
         // why did I trim extension?
         const filename = file.name.lastIndexOf(".") ? file.name.substring(0, file.name.lastIndexOf(".")) : file.name
         uploadFiles.value.push( { file:file, filename:filename, url:URL.createObjectURL(file) })
      }
   }

   const manifestItems = computed(() => { return manifestContents.value ? JSON.parse(manifestContents.value) : [] })
  
   const fileNameToManifest = computed(() => { 
      const map = new Map()
      for (const manifestItem of manifestItems.value) {
         // console.log("title", manifestItem.title)
         const trimmedFilename = manifestItem.filename.slice(0, manifestItem.filename.lastIndexOf('.'))
         map.set(trimmedFilename, manifestItem)
      }
      return map
   })

   const unknownManifestArtists = computed(() => { 
      console.log("unknownManifestArtists")
      const unknownArtists = []
      for (const manifestItem of manifestItems.value) {
         const manifestArtist = manifestItem.artist
         if (!manifestArtistToArtist.has(manifestArtist) && !unknownArtists.includes(manifestArtist)) {
            console.log("check Artist", manifestArtist)
            const artist = artistMgr.getMatchingArtist(manifestArtist) 
            if (artist) { manifestArtistToArtist.set(manifestArtist, artist) }
            else { unknownArtists.push(manifestArtist) }
         }
      }
      return unknownArtists.length ? unknownArtists : null
   })

   const addArtist = (artistFirstLast) => { artistMgr.addArtistFirstLast(artistFirstLast) }
  
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
                  const galleryIds = props.gallery ? [props.gallery.id] : []
                  console.log("galleryIds", galleryIds)


                  const manifest = fileNameToManifest.value.get(uploadContainer.uploadFile.filename)
                  const newItem = { 
                     id: uploadContainer.item.id,
                     name: manifest ? manifest.title: uploadContainer.uploadFile.filename,
                     userId: userId.value,
                     galleryIds: galleryIds,
                     primaryImage:  uploadContainer.item.primaryImage,
                     type: ItemType.SINGLE,
                     state: State.PRIVATE,
                  }
                  if (manifest?.descHtml?.length) { newItem.desc = manifest?.descHtml }
                  if (manifest?.artist?.length) {
                     const artist = manifestArtistToArtist.get(manifest.artist)
                     if (artist) {
                        newItem.primaryArtist = {
                           id:       artist.id,
                           name:     artist.name,     
                           fullName: artist.fullName, 
                           allNames: artist.allNames 
                        } 
                     }
                  }
                  itemStore.setItem(newItem)

                  if (props.gallery) {
                     // add new item at front of gallery
                     const itemIds = [ newItem.id ]
                     if (props.gallery.itemIds ) { itemIds.push(...props.gallery.itemIds) }
                     console.log("gallery.itemIds", itemIds)
                     galleryStore.updateGallery({
                        id: props.gallery.id,
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
.artist-sm-btn {
   /* Background and Border */
   background-color: #efefef !important;
   border: 1px solid #767676 !important;
  
   /* The "Squared" look: small 2px or 3px radius */
   border-radius: 4px !important;
  
   min-height: 0;
   line-height: 1; 
   height: auto; 
   display: inline-flex; 
   /* Text Styling */
   text-transform: none !important; /* Removes all-caps */
   letter-spacing: normal !important;
   font-weight: 400 !important;
   color: #000000 !important;
  
   /* Padding adjustment for compact look */
   padding: 0px 3px !important; 
}
.artist-title {
   font-weight: bold;
}
</style>
