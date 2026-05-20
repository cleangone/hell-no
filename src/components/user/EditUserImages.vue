<template>
   <span class="text-left">
      <TextButton text="Add item images" @click="addItemImages()" class="ml-n2"/>
   </span>
   <v-data-table v-if="viewTable" :headers="headers" :items="userImages" item-key="id">
       <template v-slot:item.image="{ item }">
         <img :src="item.thumbUrl" height="75" class="image-circle"/>
      </template>
      <template v-slot:item.active="{ item }" >
         <div width="100%" class="d-flex justify-center">
            <v-checkbox v-model="item.active" @change="updateActive(item)" class="mt-5"/>
         </div>
      </template>
     <template v-slot:item.actions="{ item }">
         <DeleteButton @click="deleteImage(item)"/>
      </template>
   </v-data-table>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useItemStore } from '@/stores/itemStore'
   import TextButton   from '@/components/util/TextButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import { ImageType } from '@/utils/constants'

   const userStore = useUserStore()
   const itemStore = useItemStore()
   const viewTable = ref(true)
   
   const headers = [
      { title: '',       key: 'image',      align: 'center', sortable: false },
      { title: 'Active', key: 'active',     align: 'center', sortable: false },
      { title: '',       key: 'actions',    align: 'center', sortable: false }
   ]

   // read from store so list is dynamically updated if image deleted
   const userImages = computed(() => userStore.user.images ? userStore.user.images : [])
   
   const addItemImages = () => { 
      const images = [ ...userImages.value ]
      const currImageIds = images.map(image => image.id)
      for (const item of itemStore.myItems) {
          if (!item.profileId) {
            for (const itemImage of item.otherImages) {
               if (itemImage.imageType == ImageType.USER && !currImageIds.includes(itemImage.id))  {
                  images.push(itemImage)
               }
            }
         }
      }
      userStore.updateImages(images)
   }

   const updateActive = (itemImage) => { 
      const updatedImages = []
      for (const image of userImages.value) {
         if (image.id == itemImage.id) {
            const updatedImage = { ...image }
            updatedImage.active = itemImage.active
            updatedImages.push(updatedImage)
         }
         else { updatedImages.push(image)}
      }
      userStore.updateImages(updatedImages) 
   }
   
   const deleteImage = (itemImage) => { userStore.removeImage(itemImage) }
</script>

<style>
</style>