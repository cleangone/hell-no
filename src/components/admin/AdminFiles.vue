<template>
   <div v-if="orphanFolder">
      <AdminFileOrphans :folder="orphanFolder" @done="orphanFolder=null"/>
   </div>
   <div v-else class="text-left">
      <div>
         <span class="text-h5">Files</span>
         <TextButton text="refresh files" @click="refresh=refresh+1"/>
      </div>
      <v-data-table :headers="headers" :items="displayFolders" items-per-page="25" density="compact">
         <template v-slot:item.files="{ item }">
            {{ item.files.length ? item.files.length : " "}}
         </template>
         <template v-slot:item.orphans="{ item }">
            {{ item.orphanFiles.length ? item.orphanFiles.length : " "}}
         </template>
         <template v-slot:item.actions="{ item }">
            <TextButton v-if="item.files.length && item.orphanFiles.length" text="handle orphans" @click="handleOrphans(item)"/>
         </template>
      </v-data-table>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { storage }       from '@/firebase'
   import { ref as storageRef, listAll } from "firebase/storage"
   import { computedAsync } from '@vueuse/core';
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useProfileStore } from '@/stores/profileStore'
   import AdminFileOrphans from './AdminFileOrphans.vue'
   import TextButton       from '@/components/util/TextButton.vue'
   
   const BASE_DIR = 'images/'   
   const userStore    = useUserStore()
   const itemStore    = useItemStore()
   const profileStore = useProfileStore()
   const orphanFolder = ref(null)
   const refresh      = ref(0) // force refresh of displayFolders - storage not reactive
   
   const headers = [
      { title: 'Username',  key: 'name',    value: 'name' },
      { title: 'Directory', key: 'dir',     value: 'dir' },
      { title: 'Files',     key: 'files',   align: 'center' },
      { title: 'Orphans',   key: 'orphans', align: 'center' },
      { title: '',          key: "actions" },
   ]

   const displayFolders = computedAsync(async () => {
      const unused = refresh.value
      const folders = [] 
      const dirs = [ BASE_DIR ] 
      const subDirToUserId = new Map()
      const subDirs = await getSubDirs(BASE_DIR)
      for (const subDir of subDirs) {
         dirs.push(getDir(subDir))
         subDirToUserId.set(getDir(subDir), subDir)
      }

      const dirFiles = await getDirFiles(dirs) 
      for (const dirFile of dirFiles) {
         if (dirFile.dir == BASE_DIR) {
            const folder = { 
               name: "", 
               dir: BASE_DIR, 
               files: dirFile.files,
               orphanFiles: getOrphanFiles(dirFile.files) }
            folders.push(folder)
         }
         else { 
            const user = userStore.getUser(subDirToUserId.get(dirFile.dir)) 
            const folder = { 
               name: user.username, 
               user: user, 
               dir: dirFile.dir, 
               files: dirFile.files,
               orphanFiles: getOrphanFiles(dirFile.files, user) }
            folders.push(folder)
         }
      }

      folders.sort((a, b) => a.name.localeCompare(b.name))
      return folders
   }, [] ) // initial default

   const getDir = (subDir) => { return BASE_DIR + subDir + "/" }
      
   const handleOrphans = (folder) => { orphanFolder.value = folder }
   
   const getOrphanFiles = (files, user = null) => {
      const orphans = new Set(files)
      
      if (user) {
         const items = itemStore.getUserItems(user.id) 
         for (const item of items) {
            if (item.primaryImage) { removeOrphans(item.primaryImage, orphans) }
            if (item.otherImages) { 
                for (const image of item.otherImages) {
                  removeOrphans(image, orphans) 
               }
            }
         }
         if (user.images) { 
            for (const image of user.images) {
               removeOrphans(image, orphans) 
            }
         }
         const profiles = profileStore.userIdToProfiles.get(user.id)
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

   async function getDirFiles(dirs) {
      const promises = dirs.map(async (dir) => {
         const dirRef = storageRef(storage, dir)
         try {
            const result = await listAll(dirRef)
            const files = result.items.map((item) => item.fullPath)
            return { dir: dir, files }
         } 
         catch (error) {
            console.error(`Error listing files for ${dir}:`, error)
            return { dir: dir, files: [] }
         }
      })
      return await Promise.all(promises) // await all dirs 
   }
</script>

<style>
</style>
