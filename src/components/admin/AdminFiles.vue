<template>
   <div class="text-left">
      <div class="text-h5">Files</div>
      <v-data-table :headers="headers" :items="displayFolders" items-per-page="25" density="compact">
         <template v-slot:item.files="{ item }">
            {{ item.files.length ? item.files.length : " "}}
         </template>
         <template v-slot:item.orphans="{ item }">
            {{ orphanCount(item) }}
         </template>
         <template v-slot:item.actions="{ item }">
            <TextButton v-if="item.files.length" text="check orphans" @click="handleOrphans(item)"/>
         </template>
      </v-data-table>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { storage }       from '@/firebase'
   import { listAll, ref as storageRef } from "firebase/storage"
   import { computedAsync } from '@vueuse/core';
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useProfileStore } from '@/stores/profileStore'
   import TextButton   from '@/components/util/TextButton.vue'
   
   const BASE_DIR = 'images/'   
   const userStore    = useUserStore()
   const itemStore    = useItemStore()
   const profileStore = useProfileStore()
   
   const headers = [
      { title: 'Username',  key: 'name',    value: 'name' },
      { title: 'Directory', key: 'dir',     value: 'dir' },
      { title: 'Files',     key: 'files',   align: 'center' },
      { title: 'Orphans',   key: 'orphans', align: 'center' },
      { title: '',          key: "actions" },
   ]

   const displayFolders = computedAsync(async () => {
      const folders = [] 
      const baseDirFiles = await getFiles(BASE_DIR)
      folders.push({ name: "", dir: BASE_DIR, files: baseDirFiles })
      
      const subDirToFiles = new Map()
      const subDirs = await getSubDirs(BASE_DIR)
      for (const subDir of subDirs) {
         const subDirFiles = await getFiles(getDir(subDir))
         subDirToFiles.set(subDir, subDirFiles)
      }

      for (const user of userStore.users) {
         const files = subDirToFiles.get(user.id)
         folders.push({ name:user.username, user:user, dir:getDir(user.id), files: files ? files : [] })
      }
      folders.sort((a, b) => a.name.localeCompare(b.name))
      return folders
   }, [] ) // initial default
   
   const getDir = (subDir) => { return BASE_DIR + subDir + "/" }
      
   const orphanCount = (folder) => {
      const orphans = orphanFiles(folder)
      return orphans.length ? orphans.length : ""
   }

   const handleOrphans = (folder) => {
      const orphans = orphanFiles(folder)
   }
   
   const orphanFiles = (folder) => {
      const orphans = new Set(folder.files)
      
      if (folder.user) {
         const items = itemStore.getUserItems(folder.user.id) 
         for (const item of items) {
            if (item.primaryImage) { removeOrphans(item.primaryImage, orphans) }
            if (item.otherImages) { 
                for (const image of item.otherImages) {
                  removeOrphans(image, orphans) 
               }
            }
         }
         if (folder.user.images) { 
            for (const image of folder.user.images) {
               removeOrphans(image, orphans) 
            }
         }
         const profiles = profileStore.userIdToProfiles.get(folder.user.id)
         if (profiles) {
            for (const profile of profiles) {
               for (const image of profile.images) {
                  removeOrphans(image, orphans) 
               }
            }
         }
      }
      else {
         for (const item of itemStore.items) {
            if (item.primaryImage) { removeOrphans(item.primaryImage, orphans) }
            if (item.otherImages) { 
                for (const image of item.otherImages) {
                  removeOrphans(image, orphans) 
               }
            }
         }

      }

      return [...orphans]      
   }

   const removeOrphans = (imageSet, orphans) => {
      orphans.delete(imageSet.filePath)
      orphans.delete(imageSet.thumbFilePath)
      orphans.delete(imageSet.largeThumbFilePath)
   }
   
   async function getSubDirs(parentDir) {
      const listRef = storageRef(storage, parentDir)
      const result = await listAll(listRef)
         .catch((error) => {
            console.error("Error listing folders:", error)
            return []
         })

      const dirs = []
      result.prefixes.forEach((prefixRef) => {
         dirs.push(prefixRef.name)
      })
      return dirs
   }

   async function getFiles(dir) {
      const listRef = storageRef(storage, dir)
      const result = await listAll(listRef)
         .catch((error) => {
            console.error("Error listing files:", error)
            return []
         })
      const files = []
      result.items.forEach((itemRef) => {
         files.push(dir + itemRef.name)
      })
      return files
   }
</script>

<style>
</style>
