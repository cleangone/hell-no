<template>
   <v-container>
      <v-row>
         <v-col v-if="showImage">
            <v-img :src="fileUrl" width="200"/>
         </v-col>
         <v-col>
            <v-text-field v-model="itemName" label="Item name" :rules="requiredRule"/>
            <v-select     v-model="state"    label="Visibility" :items="ItemStates"/>
            <v-combobox   v-model="artist"   label="Artist"     :items="artists" compact/> 
            <v-select     v-model="group"    label="Group"      :items="groupOptions"/>
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
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useGroupStore }   from '@/stores/groupStore'
   import { useGroupMgr }     from '@/stores/groupMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useArtistStore }  from '@/stores/artistStore'
   import { useActionStore }  from '@/stores/actionStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { dateUuid, isPublicOrGroup, requiredRule } from '@/utils/utils'
   import { ActionStatus, Emit, ItemStates, ImageType, ItemType, State }  from '@/utils/constants'

   const props = defineProps({ gallery: Object, userId: String })
   const emit  = defineEmits([ Emit.DONE ])
   const userStore    = useUserStore()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const groupStore   = useGroupStore()
   const galleryStore = useGalleryStore()
   const groupMgr     = useGroupMgr()
   const artistStore  = useArtistStore()
   const actionStore  = useActionStore()
   const viewStore    = useViewStore()
   const itemDefaults = ref({ state: State.PRIVATE, artistOption: null, groupOption: null })
   const itemName = ref('')
   const itemState = ref(null)
   const artistOption = ref(null)
   const groupOption  = ref(null)
   const itemFile = ref('')
   const fileUrl = ref('')
   const uploadStatus = ref('')

   onMounted(() => {
      if (viewStore.addItemDefaults && !props.userId) { itemDefaults.value = viewStore.addItemDefaults }
      itemState.value    = itemDefaults.value.state
      artistOption.value = itemDefaults.value.artistOption
      groupOption.value  = itemDefaults.value.groupOption
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

   const artists = computed(() => { 
      const options = [{ title: null, value: {} }]

      const artists = props.userId ? artistStore.visibleSiteArtists : artistStore.myVisibleArtists
      for (const artist of artists) {
         const option = { title: artist.fullName, value: artist }
         options.push(option)
      }
      return options
   })
   const artist = computed({ 
      get() { return artistOption.value },
      set(option) {
         artistOption.value = option
         itemDefaults.value.artistOption = option
         if (!props.userId) { viewStore.setAddItemDefaults(itemDefaults.value) }
      }
   })

   const groupOptions = computed(() => { 
      const options = [{ title: null, value: {} }]

      const groups = props.userId ? groupMgr.getUserMemberGroups(props.userId) : groupStore.myGroups
      if (groups) {
         for (const group of groups) {
            options.push({ title: group.name, value: group })
         }
      }
      return options
   })

   const group = computed({ 
      get() { return groupOption.value },
      set(option) {
         groupOption.value = option
         itemDefaults.value.groupOption = option
         if (!props.userId) { viewStore.setAddItemDefaults(itemDefaults.value) }
      }
   })

   const addItem = () => {
      const itemImage = itemMgr.createItemImage(ImageType.PRIMARY, userId.value)
      const imageRef = storageRef(storage, itemImage.filePath)

      let img = new Image()
      img.onload = () => { itemImage.dimensions =  { width: img.width, height: img.height } }
      img.src = fileUrl.value

      const primaryArtist = itemDefaults.value.artistOption ? 
         {  id:       itemDefaults.value.artistOption.value.id,
            name:     itemDefaults.value.artistOption.value.name,     
            fullName: itemDefaults.value.artistOption.value.fullName, 
            allNames: itemDefaults.value.artistOption.value.allNames 
         } : 
         null  

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
               const item = {
                  id:     dateUuid(),
                  name:   itemName.value,
                  state:  itemState.value,
                  type:   ItemType.SINGLE,
                  userId: userId.value,
                  galleryIds: props.gallery ? [props.gallery.id] : [],
                  groupIds: itemDefaults.value.groupOption?.id ? [itemDefaults.value.groupOption.id] : [],
                  primaryArtist: primaryArtist,
                  primaryImage: itemImage,
               }
               // console.log("Adding item", item)
               const addedItem = itemStore.setItem(item)
               
               // add chained actions to populated thumb images and publish to feed
               const chainedActionId = isPublicOrGroup(addedItem) && addedItem.groupIds.length ?
                  actionStore.addChainedFeedAction({ ...addedItem }) : null
               actionStore.addImageAction(item.id, userId.value, itemImage, chainedActionId)

               if (props.gallery) {
                  // add new item at front of gallery
                  const itemIds = [ item.id ]
                  if (props.gallery.itemIds) { itemIds.push(...props.gallery.itemIds) }
                  galleryStore.updateGallery({ id: props.gallery.id, itemIds: itemIds })
               }
            })

            emit(Emit.DONE)
         }
      )
   }
</script>

<style>
</style>
