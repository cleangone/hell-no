<template>
   <v-card :title="action" class="image-edit-dialog">
      <template v-slot:append>
         <IconButton v-if="showAdd"        icon="mdi-close" @click="showAdd=false"/>
         <IconButton v-else-if="showImage" icon="mdi-close" @click="showImage=false"/>
         <IconButton v-else-if="showCrop"  icon="mdi-close" @click="showCrop=false"/>
         <IconButton v-else-if="showEdit"  icon="mdi-close" @click="showEdit=false"/>
         <IconButton v-else                icon="mdi-close" @click="$emit(Emit.DONE)"/>
      </template>
      <div v-if="showAdd">
         <UploadImage :uploadHandler="imageHandler":uploadContext="uploadContext" bypassTitle @done="showAdd=false"/>
      </div>
      <div v-else-if="showImage">
         <v-img :src="itemImageToShow.url" contain @click="showImage=false" class="mx-3" :class="imageClass(itemImageToShow)"/>
      </div>
      <CropImage v-else-if="showCrop" :item="item" :imageToCrop="imageToCrop" :cropImageType="cropImageType"
         :uploadHandler="imageHandler" :uploadContext="uploadContext" @done="showCrop=false"/>
      <div v-else-if="showEdit" class="ml-5 mt-2">
         <img :src="selectedImage.thumbUrl" height="200" class="mb-2"/>
         <div style="max-width:50%">
            <v-select v-model="selectedImage.imageType" label="Image Type" :items="EditableImageTypes"/>
            <v-text-field v-model="selectedImage.name" label="Image Name"/>
            <span>
               <v-btn @click="saveImage()"    color="primary" variant="text">Save</v-btn>   
               <v-btn @click="showEdit=false" color="primary" variant="text">Cancel</v-btn>
            </span>   
         </div>
      </div>
      <div v-else>
         <TextButton @click="showAdd=true" text="Add Image" class="mx-3"/>
         <v-data-table :headers="headers" :items="displayImages" item-key="id">
            <template v-slot:header.showWithItem="{ header }">
               Item<br>Page
            </template>
            <template v-slot:item.image="{ item }">
               <img :src="item.thumbUrl" @click="showItemImage(item)" height="75" class="hand" :class="imageClass(item)"/>
            </template>
            <template v-slot:header.imageType="{ }">
               <div class="d-flex justify-center align-center">
                  Type
                  <ToolTip iconClass="ml-n2">Background, Gallery and Header images visible to Gallery</ToolTip>
               </div>
            </template>
            <template v-slot:item.showWithItem="{ item }">
               <v-checkbox v-if="isPrimaryImage(item)" v-model="TRUE" disabled class="ml-3 mt-4"/> 
               <v-checkbox v-else v-model="item.showWithItem" @click="toggleShowWithItem(item)" class="ml-3 mt-4"/> 
            </template>
            <template v-slot:item.wall="{ item }">
               <!-- <div v-if=imageOnWall(item.id) class="d-flex flex-column"> -->
               <div v-if=imageOnMyWall(item.id)>My Wall</div>
               <!-- </div> -->
               <TextButton v-else @click="addToWall(item)" text="Add"/>
            </template>
            <template v-slot:item.cropActions="{ item }">
               <div v-if="isPrimaryImage(item)" class="d-flex flex-column">
                  <TextButton text="crop"         @click="cropImage(item, ImageType.CROP)"/>
                  <TextButton text="gallery crop" @click="cropImage(item, ImageType.GALLERY)"/>
                  <TextButton text="avatar crop"  @click="cropImage(item, ImageType.USER)"/>
               </div>
            </template>
            <template v-slot:item.actions="{ item }">
               <EditButton   v-if="canEdit(item)" @click="editItemImage(item)" class="admin-link"/>
               <DeleteButton v-if="!isPrimaryImage(item)" @click="deleteImage(item)" class="admin-link"/>
            </template>
         </v-data-table>
      </div>
   </v-card> 
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useWallStore }    from '@/stores/wallStore'
   import { useEditItemImageHandler } from '@/stores/image/editItemImageHandler'
   import UploadImage  from '@/components/image/UploadImage.vue'
   import CropImage    from '@/components/image/CropImage.vue'
   import EditButton   from '@/components/util/EditButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import IconButton   from '@/components/util/IconButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import ToolTip      from '@/components/util/ToolTip.vue'
   import { Emit, GalleryImageTypes, ImageType } from '@/utils/constants'

   const TRUE = true
   const props = defineProps({item: Object})
   const emit  = defineEmits([Emit.DONE])

   const EditableImageTypes = [ ImageType.PRIMARY, ImageType.CROP, ImageType.OTHER, ImageType.HEADER, ImageType.BACKGROUND ]
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const wallStore    = useWallStore()
   const imageHandler = useEditItemImageHandler()
   const showAdd   = ref(false)
   const showImage = ref(false)
   const showCrop  = ref(false)
   const showEdit  = ref(false)
   const itemImageToShow = ref(null)
   const imageToCrop = ref(null)
   const cropImageType = ref("")
   const selectedImage = ref({})
   
   // read from store so list is dynamically updated if crop adds an image
   const item   = computed(() => itemMgr.myItemIdToItem.get(props.item.id))
   const action = computed(() => showAdd.value ? "Add Image" : "Edit Images")
   
   const headers = [
      { title: '',            value: 'image',     align: 'center' },
      { title: 'Type',        value: 'imageType', align: 'center' },
      { title: 'Name',        value: 'name' },
      { title: 'Item Page', key: 'showWithItem', value: 'showWithItem', align: 'center' },
      { title: 'Wall',    key: 'wall', align: 'center' },
      { title: "",        key: "cropActions" },
      { title: "",        key: "actions" }
   ]

   // grab props values if store not loaded yet
   const displayImages = computed(() => { 
      return item.value ? [ item.value.primaryImage, ...item.value.otherImages] : [ props.item.primaryImage, ...props.item.otherImages ]
   })

   const imageOnMyWall  = (imageId) => { return wallStore.myWallIncludesImage(imageId) }
   
   const isPrimaryImage = (itemImage) => { return itemImage.imageType == ImageType.PRIMARY }
   const canEdit        = (itemImage) => { return EditableImageTypes.includes(itemImage.imageType) }
   const addToWall      = (itemImage) => { wallStore.addMyWallItem(item.value, itemImage) }

   const showItemImage = (itemImage) => {
      itemImageToShow.value = itemImage
      showImage.value = true
   }

   const imageClass = (itemImage) => { return itemImage.imageType == ImageType.USER ? "image-circle" : "" }

   const toggleShowWithItem = (itemImage) => {
      const itemToUpdate = { id:item.value.id, otherImages:[ ...item.value.otherImages ] }
      for (const image of itemToUpdate.otherImages) {
         if (image.id == itemImage.id) { image.showWithItem = !itemImage.showWithItem }
      }
      itemStore.updateItem(itemToUpdate)
   }

   const editItemImage = (itemImage) => {
      // console.log("editItemImage", itemImage)
      selectedImage.value = {
         id: itemImage.id,
         imageType: itemImage.imageType,
         name: itemImage.name,
         thumbUrl: itemImage.thumbUrl
      }
      showEdit.value = true
   }
   
   const saveImage = () => {
      const itemToUpdate = { id:item.value.id, otherImages:[] }
      for (const image of item.value.otherImages) {
         if (image.id == selectedImage.value.id) {
            const updatedImage = { ...image }
            if (selectedImage.value.name) { updatedImage.name = selectedImage.value.name }
            if (selectedImage.value.imageType != updatedImage.imageType) {
               updatedImage.imageType = selectedImage.value.imageType

               if (GalleryImageTypes.includes(updatedImage.imageType) && GalleryImageTypes.includes(image.imageType)) {
                  updateGalleryImage(updatedImage)
               }
               else if (GalleryImageTypes.includes(updatedImage.imageType)) { addGalleryImage(updatedImage) }
               else if (GalleryImageTypes.includes(image.imageType)) { removeGalleryImage(updatedImage.id) }
            }
            
            if (isPrimaryImage(selectedImage.value)) {
               // swap the selected image into primaryImage and the exisiting primary to otherImages
               const existingPrimaryImage = { ...item.value.primaryImage }
               existingPrimaryImage.imageType = ImageType.OTHER
               itemToUpdate.otherImages.push(existingPrimaryImage)
               itemToUpdate.primaryImage = updatedImage
            }
            else { itemToUpdate.otherImages.push(updatedImage) }
         }
         else { itemToUpdate.otherImages.push(image) }
      }
     
      itemStore.updateItem(itemToUpdate)
      showEdit.value = false
   }
   
   const deleteImage = (itemImage) => {
      itemStore.removeOtherImage(props.item.id, itemImage)
      if (GalleryImageTypes.includes(itemImage.imageType)) { removeGalleryImage(itemImage.id) }
      wallStore.removeWallsImageId(itemImage.id)
   }

   // 
   // upload/crop image
   //
   const uploadContext = computed(() => { return { uploadImageType:ImageType.OTHER, itemId:props.item.id }})
   const cropImage = (imageSet, imageType) => {
      imageToCrop.value = imageSet
      cropImageType.value = imageType
      showCrop.value = true
   }

   const addGalleryImage = (itemImage) => {
      const galleryImage = galleryMgr.galleryImage(item.value, itemImage, true)
      for (const galleryId of props.item.galleryIds) {
         galleryStore.addImage(galleryId, galleryImage)   
      }
   }

   const updateGalleryImage = (itemImage) => {
      for (const galleryId of props.item.galleryIds) {
         galleryStore.updateImage(galleryId, itemImage)   
      }
   }

   const removeGalleryImage = (itemImageId) => {
      for (const galleryId of props.item.galleryIds) {
         galleryStore.removeImageId(galleryId, itemImageId)   
      }
   }
</script>

<style>
.card-actions {
  position: fixed;
  bottom: 5px;
  right: 5px;
  z-index: 5;
} 
.image-edit-dialog {
   min-width: 800px;  
   min-height: 600px;  
}
.image-circle {
  border-radius: 50%; 
  object-fit: cover;
}      
</style>