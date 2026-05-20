<template>
   <span class="text-left">
      <TextButton text="Add item images" @click="addItemImages()" class="ml-1 mt-n4"/>
   </span>
   <v-data-table v-if="viewTable" :headers="headers" :items="profileImages" item-key="id">
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
   import { useProfileStore } from '@/stores/profileStore'
   import { useItemStore }    from '@/stores/itemStore'
   import TextButton   from '@/components/util/TextButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import { Emit, ImageType } from '@/utils/constants'
   
   const props = defineProps({ profileId: String })
   const emit = defineEmits([ Emit.DONE ])

   const profileStore = useProfileStore()
   const itemStore    = useItemStore()
   const viewTable = ref(true)
   
   const headers = [
      { title: '',       key: 'image',      align: 'center', sortable: false },
      { title: 'Active', key: 'active',     align: 'center', sortable: false },
      { title: '',       key: 'actions',    align: 'center', sortable: false }
   ]

   // read from store so list is dynamically updated if image deleted
   const profile       = computed(() => profileStore.getMyProfile(props.profileId))
   const profileImages = computed(() => profile.value?.images ? profile.value.images : [])
   
   const addItemImages = () => { 
      const imageIds = profileImages.value.map(image => image.id)
      for (const item of itemStore.myItems) {
          if (item.profileId == props.profileId) {
            console.log("item", item.name)
            for (const itemImage of item.otherImages) {
               if (itemImage.imageType == ImageType.USER && !imageIds.includes(itemImage.id))  {
                  profileStore.addImage(props.profileId, itemImage)
                  imageIds.push(itemImage.id)
               }
            }
         }
      }
   }

   const updateActive = (itemImage) => { 
      const updatedImages = []
      for (const image of profileImages.value) {
         if (image.id == itemImage.id) {
            const updatedImage = { ...image }
            updatedImage.active = itemImage.active
            updatedImages.push(updatedImage)
         }
         else { updatedImages.push(image)}
      }
      profileStore.updateProfile({ id: props.profileId, images: updatedImages }) 
   }
   
   const deleteImage = (itemImage) => { profileStore.removeImage(props.profileId, itemImage) }
</script>

<style>
</style>