<template>
   <v-card title="Group Images" class="edit-group-dialog">
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)" class="admin-link"/>
      </template>
   
      <span class="text-left mt-n3">
         <TextButton text="Upload Image" @click="showUploadDialog=true" class="mx-3"/>
         <!-- <TextButton text="Add item images" @click="addItemImages()" class="ml-n2"/> -->
      </span>

      <CropImage v-if="showCrop" :imageToCrop="imageToCrop" :cropImageType="cropImageType" 
         :uploadHandler="imageHandler" :uploadContext="uploadContext" @done="showCrop=false"/>

      <v-data-table v-else :headers="headers" :items="groupImages" item-key="id">
         <template v-slot:item.image="{ item }">
            <img :src="item.thumbUrl" height="75"/>
         </template>
         <template v-slot:item.active="{ item }" >
            <div v-if="item.imageType == ImageType.GROUP" width="100%" class="d-flex justify-center">
               <v-checkbox v-model="item.active" @change="updateImage(item)" class="mt-5"/>
            </div>
         </template>
         <template v-slot:item.cropActions="{ item }">
            <div v-if="imageMgr.isUploadImage(item)" class="d-flex flex-column">
               <TextButton text="group crop" @click="cropImage(item, ImageType.GROUP)"/>
            </div>
         </template>
         <template v-slot:item.actions="{ item }">
            <DeleteButton @click="deleteImage(item)"/>
         </template>
      </v-data-table>
   </v-card>
   <v-dialog v-model="showUploadDialog" width="auto">
      <UploadImage :uploadHandler="imageHandler" :uploadContext="uploadContext" @done="showUploadDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemStore }  from '@/stores/itemStore'
   import { useGroupStore } from '@/stores/groupStore'
   import { useImageMgr }   from '@/stores/image/imageMgr'
   import { useGroupImageHandler } from '@/stores/image/groupImageHandler'
   import UploadImage       from '@/components/image/UploadImage.vue'
   import CropImage         from '@/components/image/CropImage.vue'
   import IconButton        from '@/components/util/IconButton.vue'
   import TextButton        from '@/components/util/TextButton.vue'
   import DeleteButton      from '@/components/util/DeleteButton.vue'
   import { ImageType } from '@/utils/constants'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ groupId: String })
   const emit  = defineEmits([Emit.DONE])

   const groupStore = useGroupStore()
   const itemStore    = useItemStore()
   const imageMgr     = useImageMgr()
   const imageHandler = useGroupImageHandler()
   const showCrop  = ref(false)
   const imageToCrop = ref(null)
   const cropImageType = ref("")
   const showUploadDialog = ref(false)
   
   const headers = [
      { title: '',       key: 'image',       align: 'center', sortable: false },
      { title: 'Type',   value: 'imageType', align: 'center' },
      { title: 'Active', key: 'active',      align: 'center', sortable: false },
      { title: "",       key: "cropActions" },
      { title: '',       key: 'actions',     align: 'center', sortable: false }
   ]
   
   // read from store so image list dynamically updated 
   const group         = computed(() => groupStore.getMyGroup(props.groupId))
   const groupImages   = computed(() => group.value?.images ?? [])
   const uploadContext = computed(() => { return { uploadImageType:ImageType.UPLOAD, groupId:props.groupId }})
   
   const cropImage = (imageSet, imageType) => {
      imageToCrop.value = imageSet
      cropImageType.value = imageType
      showCrop.value = true
   }
   
   // commented out because group items somewhat hidden, so doesn't make sense to get from item
   // const addItemImages = () => { 
   //    const images = [ ...userImages.value ]
   //    const currImageIds = images.map(image => image.id)
   //    for (const item of itemStore.myItems) {
   //       for (const imageSet of item.otherImages) {
   //          if (imageSet.imageType == ImageType.USER && !currImageIds.includes(imageSet.id))  {
   //             images.push({ ...imageSet, originItemId: item.id })
   //          }
   //       }
   //    }
   //    userStore.updateImages(images)
   // }

   const updateImage  = (imageSet) => { groupStore.updateImage(props.groupId, imageSet) }
   const deleteImage  = (imageSet) => { groupStore.deleteImage(props.groupId, imageSet) }
</script>

<style>
</style>