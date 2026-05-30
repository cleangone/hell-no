<template>
   <span class="text-left">
      <TextButton text="Upload Image" @click="showUploadDialog=true" />
      <TextButton text="Add item images" @click="addItemImages()"/>
   </span>
   <CropImage v-if="showCrop" :imageToCrop="imageToCrop" :cropImageType="cropImageType" 
      :uploadHandler="imageHandler" :uploadContext="uploadContext" @done="showCrop=false"/>
   <v-data-table v-else :headers="headers" :items="profileImages" item-key="id">
       <template v-slot:item.image="{ item }">
         <img :src="item.thumbUrl" height="75" :class="imageMgr.isUserImage(item) ? 'image-circle' : ''"/>
      </template>
      <template v-slot:item.active="{ item }" >
         <div width="100%" class="d-flex justify-center">
            <v-checkbox v-model="item.active" @change="updateActive(item)" class="mt-5"/>
         </div>
      </template>
      <template v-slot:item.cropActions="{ item }">
         <div v-if="imageMgr.isUploadImage(item)" class="d-flex flex-column">
            <TextButton text="avatar crop" @click="cropImage(item, ImageType.USER)"/>
         </div>
      </template>
      <template v-slot:item.actions="{ item }">
         <DeleteButton @click="deleteImage(item)"/>
      </template>
   </v-data-table>

    <v-dialog v-model="showUploadDialog" width="auto">
      <UploadImage :uploadHandler="imageHandler" :uploadContext="uploadContext" @done="showUploadDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useProfileStore } from '@/stores/profileStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useImageMgr }     from '@/stores/image/imageMgr'
   import { useProfileImageHandler } from '@/stores/image/profileImageHandler'
   import UploadImage  from '@/components/image/UploadImage.vue'
   import CropImage    from '@/components/image/CropImage.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import { Emit, ImageType } from '@/utils/constants'
   
   const props = defineProps({ profileId: String })
   const emit = defineEmits([ Emit.DONE ])

   const profileStore = useProfileStore()
   const itemStore    = useItemStore()
   const imageMgr     = useImageMgr()
   const imageHandler = useProfileImageHandler()
   const showCrop     = ref(false)
   const imageToCrop  = ref(null)
   const cropImageType = ref("")
   const showUploadDialog = ref(false)
  
   const headers = [
      { title: '',       key: 'image',       align: 'center', sortable: false },
      { title: 'Type',   value: 'imageType', align: 'center' },
      { title: 'Active', key: 'active',      align: 'center', sortable: false },
      { title: "",       key: "cropActions" }, 
      { title: '',       key: 'actions',     align: 'center', sortable: false }
   ]

   // read from store so list is dynamically updated if image deleted
   const profile       = computed(() => profileStore.getMyProfile(props.profileId))
   const profileImages = computed(() => profile.value?.images ? profile.value.images : [])
   const uploadContext = computed(() => { return { uploadImageType:ImageType.UPLOAD, profileId:props.profileId }})
   
   const addItemImages = () => { 
      const imageIds = profileImages.value.map(image => image.id)
      for (const item of itemStore.myItems) {
          if (item.profileId == props.profileId) {
            for (const imageSet of item.otherImages) {
               if (imageSet.imageType == ImageType.USER && !imageIds.includes(imageSet.id))  {
                  profileStore.addImage(props.profileId, { ...imageSet, originItemId: item.id })
                  imageIds.push(imageSet.id)
               }
            }
         }
      }
   }

   const updateActive = (imageSet) => { 
      const updatedImages = imageMgr.updateActiveImage(imageSet, profileImages.value)
      profileStore.updateProfile({ id: props.profileId, images: updatedImages }) 
   }

   const cropImage = (imageSet, imageType) => {
      imageToCrop.value = imageSet
      cropImageType.value = imageType
      showCrop.value = true
   }
   
   const deleteImage = (imageSet) => { 
      profileStore.removeImage(props.profileId, imageSet)
      if (!imageSet.originItemId) { imageMgr.deleteImages(imageSet) }
   }
</script>

<style>
</style>