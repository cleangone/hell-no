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
         <v-row class="mx-3 mt-2">
            <v-col v-if="showUploadImage" class="text-center">
               <v-img :src="fileUrl" width="200"/>
            </v-col>
            <v-col>
               <input id="fileInput" type="file" @change="handleFileChange"/>
               <v-card-text>
                  <div>{{ uploadStatus }}</div>
               </v-card-text>
            </v-col>
         </v-row>
         <div class="card-actions">  <!-- float at bottom -->
            <v-btn @click="uploadFile()"  color="primary" variant="text" class="mr-4 bg-white">Upload file</v-btn>
            <v-btn @click="showAdd=false" color="primary" variant="text" class="bg-white">Cancel</v-btn>
         </div>
      </div>
      <div v-else-if="showImage">
         <v-img :src="itemImageToShow.url" contain @click="showImage=false" class="mx-3"/>
      </div>
      <div v-else-if="showCrop">
         <v-form>
            <cropper v-if="cropImageType == ImageType.GALLERY" ref="cropperElement" class="image-cropper" :src="urlToCrop" @change="onCropChange"
               :stencil-props="{aspectRatio: 16/9}"/>
            <cropper v-else ref="cropperElement" class="image-cropper" :src="urlToCrop" @change="onCropChange"/>
         </v-form>
         <div class="card-actions">  <!-- float at bottom -->
            <v-btn @click="crop(item)"     color="primary" variant="text" class="mr-4 bg-white">crop</v-btn>
            <v-btn @click="showCrop=false" color="primary" variant="text" class="bg-white">cancel</v-btn>
         </div>
      </div>
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
               Item Page<!-- Show on<br>Item Page --> 
            </template>
            <template v-slot:item.image="{ item }">
               <img :src="item.thumbUrl" @click="showItemImage(item)" height="100" class="hand"/>
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
               </div>
            </template>
            <template v-slot:item.actions="{ item }">
               <EditButton   v-if="canEdit(item)" @click="editItemImage(item)"/>
               <DeleteButton v-if="!isPrimaryImage(item)" @click="deleteImage(item)"/>
            </template>
         </v-data-table>
      </div>
   </v-card> 
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { storage } from '@/firebase'
   import { ref as storageRef } from 'firebase/storage'
   import { uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
   import { Cropper } from 'vue-advanced-cropper'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useActionStore }  from '@/stores/actionStore'
   import { useWallStore }    from '@/stores/wallStore'
   import EditButton   from '@/components/util/EditButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import IconButton   from '@/components/util/IconButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import { Emit, GalleryImageTypes, ImageType } from '@/utils/constants'
   import 'vue-advanced-cropper/dist/style.css'

   const TRUE = true
   const props = defineProps({item: Object})
   const emit  = defineEmits([Emit.DONE])

   const EditableImageTypes = [ ImageType.PRIMARY, ImageType.CROP, ImageType.OTHER, ImageType.HEADER, ImageType.BACKGROUND ]
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const actionStore  = useActionStore()
   const wallStore    = useWallStore()
   const showAdd   = ref(false)
   const showImage = ref(false)
   const showCrop  = ref(false)
   const showEdit  = ref(false)
   const cropperElement = ref(null)
   const itemImageToShow = ref(null)
   const itemImageToCrop = ref(null)
   const cropCoordinates = ref(null)
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
   const addToWall      = (itemImage) => {
      
      console.log("Adding wall item with different image", item.value)
      console.log("Item primaryimage", item.value.primaryImage)
         
      wallStore.addMyWallItem(item.value, itemImage) }

   const showItemImage = (itemImage) => {
      itemImageToShow.value = itemImage
      showImage.value = true
   }

   const toggleShowWithItem= (itemImage) => {
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
      let feedItemToUpdate = null
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

               feedItemToUpdate = {
                  id:      item.value.id,
                  name:    item.value.name,
                  state:   item.value.state,
                  type:    item.value.type,
                  userId:  item.value.userId,
                  groupIds:      item.value.groupIds,
                  primaryArtist: item.value.primaryArtist,
                  primaryImage:  itemToUpdate.primaryImage
               }
            }
            else { itemToUpdate.otherImages.push(updatedImage) }
         }
         else { itemToUpdate.otherImages.push(image) }
      }
     
      const updatedItem = itemStore.updateItem(itemToUpdate)
      if (feedItemToUpdate) { actionStore.addFeedAction({ ...feedItemToUpdate, dateModified:updatedItem.dateModified }) } 
      
      showEdit.value = false
   }
   
   const deleteImage = (itemImage) => {
      itemStore.removeOtherImage(props.item.id, itemImage)
      if (GalleryImageTypes.includes(itemImage.imageType)) { removeGalleryImage(itemImage.id) }
      wallStore.removeWallsImageId(itemImage.id)
   }

   // 
   // upload image
   //
   const itemFile = ref('')
   const fileUrl = ref('')
   const uploadStatus = ref('')
   
   const showUploadImage = computed(() => { return fileUrl.value.length ? true : false })   

   const handleFileChange = (e) => {
      itemFile.value = e.target.files[0]
      fileUrl.value = URL.createObjectURL(itemFile.value)
   }
   
   const uploadFile = () => {
      // console.log("addItem", itemName.value, props.gallery ? props.gallery.name : "no gallery" )
      const itemImage = itemMgr.createItemImage(ImageType.OTHER, item.value.userId)
      actionStore.addImageAction(props.item.id, props.item.userId, itemImage)
      const imageRef = storageRef(storage, itemImage.filePath)

      let img = new Image()
      img.onload = () => { itemImage.dimensions = { width: img.width, height: img.height } }
      img.src = fileUrl.value

      const uploadTask = uploadBytesResumable(imageRef, itemFile.value, { contentType: itemFile.value.type })
      uploadTask.on('state_changed',
         (snapshot) => {
            const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            uploadStatus.value = 'Upload ' + progress + '% done'
         },
         (error) => {
            console.log("Upload failed", error)
         },
         () => {
            // successful upload
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
               itemImage.url = downloadURL
               itemImage.thumbUrl = downloadURL

               console.log("Adding item.otherImages", downloadURL)
               itemStore.addOtherImage(props.item.id, itemImage) 
            })

            showAdd.value = false
         }
      )
   }

   //
   // crop image
   //
   const urlToCrop = computed(() => { 
      const url = itemImageToCrop.value ? itemImageToCrop.value.url + "&random=" + Math.random() : ""
      return url
   })

   const cropImage = (itemImage, imageType) => {
      // todo - only ever crop the item.primaryImage - don't really need itemImageToCrop
      itemImageToCrop.value = itemImage
      cropImageType.value = imageType
      showCrop.value = true
   }
   
   const onCropChange = ({ coordinates, canvas }) => { cropCoordinates.value = coordinates }

   const crop = () => {
      const result = cropperElement.value.getResult()
      const croppedUrl = result.canvas.toDataURL("image/jpeg")
      
      const croppedItemImage = itemMgr.createItemImage(cropImageType.value, item.value.userId)
      actionStore.addImageAction(props.item.id, props.item.userId, croppedItemImage)
      croppedItemImage.dimensions = { width: cropCoordinates.value.width, height: cropCoordinates.value.height }      
                    
      const imageRef = storageRef(storage, croppedItemImage.filePath)
      fetch(croppedUrl).then(result => {
         // console.log("getting blob")
         return result.blob()
      }).then(blob => {
         // console.log("uploading blob")
         uploadBytes(imageRef, blob, { contentType: "image/jpeg" }).then(function(snapshot) {
            // console.log("getting downloadURL", snapshot)
            return getDownloadURL(snapshot.ref)
         }).then(downloadURL => {
            // console.log("Cropped downloadURL", props.item.id, downloadURL); 
            croppedItemImage.url = downloadURL
            croppedItemImage.thumbUrl = downloadURL // for initial image display, will be overwritten
            
            // possible race condition with thumb processing finishing before item updated?
            itemStore.addCroppedImage(props.item.id, croppedItemImage)  // initial add for image display
            showCrop.value = false
         }) 
      }).catch(error => {
         console.error(error)
      })
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
.image-cropper {
  border: solid 1px #EEE;
  min-height: 300px;
  width: 100%;
}
</style>