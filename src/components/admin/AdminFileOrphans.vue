<template>
   <div class="text-h6 text-left">
      <a @click="$emit(Emit.DONE)">Files</a> > {{ folder.name }} Orphans
   </div>
   <v-data-table :headers="headers" :items="displayImageSets" items-per-page="50" density="compact" class="text-left">
      <template v-slot:item.image="{ item }">   
         <div style="min-width:200px">
            <img :src="item.url" :height="mouseoverUrl==item.url ? '100' : '50'" 
               @mouseover="mouseoverUrl=item.url" @mouseleave="mouseoverUrl=null", class="pointer"/>
         </div>
      </template>
      <template v-slot:item.actions="{ item }">
         <DeleteButton @click="deleteImageSet(item)"/>
      </template>
   </v-data-table>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { storage }       from '@/firebase'
   import { ref as storageRef, getDownloadURL, deleteObject } from "firebase/storage"
   import { computedAsync } from '@vueuse/core'
   import DeleteButton      from '@/components/util/DeleteButton.vue'
   import { Emit, FileSuffix } from '@/utils/constants'
   
   const props = defineProps({ folder:Object })
   const emit = defineEmits([Emit.DONE])
   
   const mouseoverUrl = ref(null)
   const deletedImageSetNames = ref([])
   const headers = [
      { title: 'Image Set', value: "name"    },
      { title: 'Files',     value: "files", align: 'center' },
      { title: '',          key:   "image"   },
      { title: '',          key:   "actions" },
   ]

   const displayImageSets = computed(() => { 
      const imageSets = []
      for (const imageSet of orphanImageSets.value) {
         if (!deletedImageSetNames.value.includes(imageSet.name)) { imageSets.push(imageSet) }
      }
      return imageSets
   })

   const orphanImageSets = computedAsync(async () => {
      const fileUrls = await getFileUrls(props.folder.orphanFiles)
      const fileToUrl = new Map(fileUrls.map(obj => [obj.file, obj.url]))

      const fileToImageSet = new Map()
      const mobileFiles = []
      const thumbFiles = []
      const largeThumbFiles = []
      
      for (const file of props.folder.orphanFiles) {
         if (file.endsWith(FileSuffix.MOBILE_SUFFIX)) { mobileFiles.push(file) }
         else if (file.endsWith(FileSuffix.THUMB_SUFFIX)) { thumbFiles.push(file) }
         else if (file.endsWith(FileSuffix.LARGE_THUMB_SUFFIX)) { largeThumbFiles.push(file) }
         else { 
            const url = fileToUrl.get(file)
            fileToImageSet.set(file, { name:file, url:url, files: 1, file:file, fileUrl:url }) 
         }
      }

      for (const file of mobileFiles) {
         console.log("mobileFiles", file)
         const baseFile = file.substring(0, file.indexOf(FileSuffix.MOBILE_SUFFIX) )
         const url = fileToUrl.get(file)
         addImageSet(fileToImageSet, baseFile, url, { mobileFile:file, mobileUrl:url })
      }
      
      for (const file of thumbFiles) {
         console.log("thumbFiles", file)
         const baseFile = file.substring(0, file.indexOf(FileSuffix.THUMB_SUFFIX) )
         const url = fileToUrl.get(file)
         addImageSet(fileToImageSet, baseFile, url, { thumbFile:file, thumbUrl:url })
      }

      for (const file of largeThumbFiles) {
          console.log("largeThumbFiles", file)
         const baseFile = file.substring(0, file.indexOf(FileSuffix.LARGE_THUMB_SUFFIX) )
         const url = fileToUrl.get(file)
         addImageSet(fileToImageSet, baseFile, url, { largeThumbFile:file, largeThumbUrl:url })
      }

      const imageSets = [...fileToImageSet.values()]
      imageSets.sort(function(a, b) { return  a.name.localeCompare(b.name) })
      return imageSets
   }, [] ) // initial default

   const addImageSet = (map, name, url, newImageSet) => { 
      const existingImageSet = map.get(name)
      if (existingImageSet) { 
         const updatedImageSet = { ...existingImageSet, ...newImageSet }
         updatedImageSet.files = existingImageSet.files + 1
         map.set(name, updatedImageSet)
      }
      else { map.set(name, { name:name, url:url, files: 1, ...newImageSet }) }
   }
    
   const deleteImageSet = (imageSet) => {
      const files = []
      if (imageSet.file) { files.push(imageSet.file) }
      if (imageSet.mobileFile) { files.push(imageSet.mobileFile) }
      if (imageSet.thumbFile)  { files.push(imageSet.thumbFile) }
      if (imageSet.largeThumbFile) { files.push(imageSet.largeThumbFile) }
      deleteFiles(files)
      deletedImageSetNames.value.push(imageSet.name)
   }

   async function getFileUrls(filePaths) {
      try {
         const fileUrls = await Promise.all(
            filePaths.map(async (file) => {
               const fileRef = storageRef(storage, file)
               const url = await getDownloadURL(fileRef)
               return { file:file, url:url }
            })
         )
         return fileUrls
      } 
      catch (error) {
         console.error('Failed to resolve one or more URLs:', error)
         return []
      }
   }

   async function deleteFiles(filePaths) {
      try {
         const deletePromises = filePaths.map((file) => {
            const fileRef = storageRef(storage, file)
            return deleteObject(fileRef)
         })
         await Promise.all(deletePromises)
      } 
      catch (error) {
         console.error("Error deleting files:", error)
      }
   }
</script>

<style>
</style>
