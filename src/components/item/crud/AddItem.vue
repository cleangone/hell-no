<template>
   <v-container>
      <v-row>
         <v-col v-if="showImage">
            <v-img :src="fileUrl" width="200"/>
         </v-col>
         <v-col>
            <v-text-field v-model="itemName" label="Item name" :rules="requiredRule"/>
            <v-select     v-model="state"    label="Visibility" :items="ItemStates"/>
            <EditArtist :artistContainer="primaryArtistContainer" class="mb-5"/>
            <input id="fileInput" type="file" @change="handleFileChange"/>
            <v-card-text>
               <div>{{ uploadStatus }}</div>
            </v-card-text>
         </v-col>
      </v-row>
   </v-container>
   
   <v-card-actions class="justify-end">
      <v-btn color="primary" @click="addItem()" :disabled="!dataValid">Add Item</v-btn>
      <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
   </v-card-actions>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { storage } from '@/firebase'
   import { ref as storageRef } from 'firebase/storage'
   import { uploadBytesResumable, getDownloadURL } from 'firebase/storage'
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useArtistMgr }    from '@/stores/artistMgr'
   import { useImageMgr }     from '@/stores/image/imageMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useAddItemImageHandler } from '@/stores/image/addItemImageHandler'
   import EditArtist          from './EditArtist.vue'
   import { dateUuid, requiredRule } from '@/utils/utils'
   import { Emit, ItemStates, ImageType, ItemType, State }  from '@/utils/constants'

   const props = defineProps({ gallery: Object, userId: String })
   const emit  = defineEmits([ Emit.DONE ])
   const userStore    = useUserStore()
   const itemStore    = useItemStore()   
   const galleryStore = useGalleryStore()
   const artistMgr    = useArtistMgr()
   const imageMgr     = useImageMgr()
   const viewStore    = useViewStore()
   const primaryArtistContainer = ref(artistMgr.defaultArtistContainer) 
   const imageHandler = useAddItemImageHandler()
   const itemDefaults = ref({ state: State.PRIVATE, artistOption: null })
   const itemName = ref('')
   const itemState = ref(null)
   const itemFile = ref('')
   const fileUrl = ref('')
   const uploadStatus = ref('')

   onMounted(() => {
      if (viewStore.addItemDefaults && !props.userId) { itemDefaults.value = viewStore.addItemDefaults }
      itemState.value = itemDefaults.value.state
   })

   const userId    = computed(() => props.userId ? props.userId : userStore.userId)
   const showImage = computed(() => fileUrl.value.length ? true : false)
   const dataValid = computed(() => itemName.value.length && fileUrl.value.length ? true : false)

   const handleFileChange = (e) => {
      itemFile.value = e.target.files[0]
      fileUrl.value = URL.createObjectURL(itemFile.value)
   }

   const state = computed({ 
      get() { return itemState.value },
      set(value) {
         itemState.value = value
         itemDefaults.value.state = value
         if (!props.userId) { viewStore.setAddItemDefaults(itemDefaults.value) }
      }
   })

   const addItem = () => {
      const primaryArtist = artistMgr.getArtistFromContainer(primaryArtistContainer.value)            
      const imageSet = imageMgr.createImageSet(ImageType.PRIMARY, userId.value)
      const imageRef = storageRef(storage, imageSet.filePath)

      let img = new Image()
      img.onload = () => { imageSet.dimensions = { width: img.width, height: img.height } }
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
               imageSet.url = downloadURL
               imageSet.thumbUrl = downloadURL
               imageSet.largeThumbUrl = downloadURL

               const item = {
                  id:     dateUuid(),
                  name:   itemName.value,
                  state:  itemState.value,
                  type:   ItemType.SINGLE,
                  userId: userId.value,
                  galleryIds: props.gallery ? [props.gallery.id] : [],
                  primaryArtist: primaryArtist,
                  primaryImage: imageSet,
               }
               itemStore.setItem(item)

               if (props.gallery) {
                  // add new item at front of gallery
                  const itemIds = [ item.id ]
                  if (props.gallery.itemIds) { itemIds.push(...props.gallery.itemIds) }
                  galleryStore.updateGallery({ id: props.gallery.id, itemIds: itemIds })
               }

               imageMgr.waitForThumbUrls(imageSet, imageHandler,  { itemId:item.id })        
            })

            emit(Emit.DONE)
         }
      )
   }
</script>

<style>
</style>
