<template>
   <v-form v-model="dataValid" class="mt-2">
      <div v-if="xs">
         <v-row>
            <v-col>
               <v-text-field v-model="currItemName"     label="Name/Title" :rules="requiredRule" class="ms-2"/>
               <v-text-field v-model="currAltName"      label="Alternate Name" class="ms-2"/>
               <v-text-field v-model="currItemSubtitle" label="Subtitle" class="ms-2"/>
               <v-select     v-model="currItemState"    label="Visibility" :items="ItemStates" class="ms-2"/>
               <v-text-field v-model="currYearCreated"  label="Year Created" :rules="optionalYearRule" class="ms-2"/>
               <v-combobox   v-model="artistOption"     label="Artist" :items="artistOptions" clearable compact class="ms-2"/> 
               <v-text-field v-model="currSize"         label="Size" class="ms-2"/>
               <v-checkbox   v-model="currItemWall"     label="Display on Art Wall" class="tight-checkbox"/> 
            </v-col>
         </v-row>
      </div>
      <div v-else>
         <v-row>
            <v-col>
               <v-text-field v-model="currItemName"     label="Name/Title" :rules="requiredRule" class="ms-2"/>
               <v-text-field v-model="currAltName"      label="Alternate Name" class="ms-2"/>
               <v-text-field v-model="currItemSubtitle" label="Subtitle" class="ms-2"/>
               <v-row>        
                  <v-col><v-select v-model="currItemState" label="Item State" :items="ItemStates" class="ms-2"/></v-col>
                  <v-col v-if="isMyItem && profiles.length">
                     <v-select v-model="currProfileId" label="Owned by Profile" :items="profiles" item-title="username" item-value="id" clearable/>
                  </v-col>
               </v-row>
               <v-row class="mt-n5">        
                  <v-col cols="8"><v-combobox v-model="artistOption" label="Artist" :items="artistOptions" clearable compact class="ms-2"/></v-col>
                   <v-col><v-text-field v-model="currYearCreated" label="Year Created" :rules="optionalYearRule"/></v-col>
               </v-row>
            </v-col>
            <v-col>
               <v-img v-if="primaryImage" :src="primaryImage.thumbUrl" width="200" class=""></v-img>
               <v-row v-else-if="isItemGroup(currItem)" class="d-flex justify-center">
                  <img v-for="childItem in childItems" :key="childItem.id" 
                     :src="childItem.primaryImage.thumbUrl" height="150"/>
               </v-row>
               <v-checkbox v-model="currItemWall" label="Display on Art Wall" class="tight-checkbox"/> 
            </v-col>
         </v-row>
      </div>
      <v-row>    
         <v-col>
            <div class="mx-3 my-2 rounded edit-html-div">
               <div class="ms-3 pt-2 pb-1 text-caption text-grey-darken-1">Description</div>
               <div class="mx-3 pb-3">
                  <EditHtml :contentContainer="currItemDescContainer"/>
               </div>
            </div>
         </v-col>
      </v-row>
      <div v-if="xs && isMyItem">
         <v-row>
            <v-select v-model="xsComputedGalleries" :items="xsGalleriesOptions" label="Galleries" 
               item-title="name" return-object multiple class="ms-5"/>
         </v-row>
      </div>
      <div v-else-if="isMyItem" class="expansion">
         <v-expansion-panels multiple>
            <CheckboxExpansion type="Galleries" :checkboxes="galleryCheckboxes" class="mx-3"/>
         </v-expansion-panels>
      </div>
   </v-form>
   <div style="min-height:75px"></div>
   <div class="float-bottom">  
      <v-btn @click="save()" :disabled="!dataValid" color="primary" class="mr-4">save</v-btn>
      <v-btn v-if="nextItems.length" @click="setNextCurrItem()" color="primary" class="mr-4">next</v-btn>
      <v-btn @click="$emit(Emit.DONE)" color="primary">cancel</v-btn>
   </div>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { useUserStore }    from '@/stores/userStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useArtistStore }  from '@/stores/artistStore'
   import { useProfileStore } from '@/stores/profileStore'
   import { useWallStore }    from '@/stores/wallStore'
   import { useWallMgr }      from '@/stores/wallMgr'
   import EditHtml          from '@/components/util/EditHtml.vue'
   import CheckboxExpansion from '@/components/util/CheckboxExpansion.vue'
   import { optionalYearRule, requiredRule, sortByName } from '@/utils/utils'
   import { Emit, ItemStates, ItemType } from '@/utils/constants'
   
   const props = defineProps({item: Object, items: Array})
   const emit  = defineEmits([Emit.DONE])
   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')   
   const userStore    = useUserStore()
   const itemStore    = useItemStore()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const artistStore  = useArtistStore()
   const profileStore = useProfileStore()
   const wallStore    = useWallStore()
   const wallMgr      = useWallMgr()
   const currItem = ref({})
   const currItemName      = ref('')
   const currAltName       = ref('')
   const currItemSubtitle  = ref('')
   const currItemState     = ref('')
   const currProfileId     = ref(null)
   const currYearCreated   = ref(null)
   const currItemDescContainer = ref({ content: "" })
   const currItemWall = ref(false)  
   const currItemGalleries = ref([])       
   const currItemGalleryCheckboxes = ref([])
   const artistOption  = ref(null)
   const nextItems = ref([])
   const dataValid = ref(true)

   onMounted(() => { 
      if (props.item)  { nextItems.value.push(props.item) }
      if (props.items) { nextItems.value.push(...props.items) }
      setNextCurrItem()
   })

   const setNextCurrItem = () => {
      if (nextItems.value.length) { setCurrItem(nextItems.value.shift()) }
      else { setCurrItem({}) }
   }

   const setCurrItem = (item) => {
      currItem.value = item
      currItemName.value = item.name
      currAltName.value = item.alternateName ? item.alternateName : ""
      currItemSubtitle.value = item.subtitle ? item.subtitle : ""
      currItemState.value = item.state
      currProfileId.value = item.profileId ? item.profileId : null
      currYearCreated.value = item.yearCreated
      currItemDescContainer.value.content = item.desc ? item.desc : ""
      currItemWall.value = wallStore.myWallIncludesItem(item.id)
      
      // once, twice, refactor... 
      const galleryCheckboxes = []
      currItemGalleries.value = []   
      for (const gallery of [...galleryStore.myGalleries] ) {
         const isSelected = item.galleryIds?.includes(gallery.id)
         if (isSelected) { currItemGalleries.value.push(gallery) }
         galleryCheckboxes.push({ id: gallery.id, name: gallery.name, selected: isSelected })
      }
      for (const gallery of galleryStore.myContributingGalleries ) {
         const isSelected = item.galleryIds?.includes(gallery.id)
         if (isSelected) { currItemGalleries.value.push(gallery) }
         galleryCheckboxes.push({ id: gallery.id, name: gallery.name + "(Contributor)", selected: isSelected })
      }
      currItemGalleryCheckboxes.value = galleryCheckboxes
   }

   const isMyItem = computed(() => currItem.value && currItem.value.userId == userStore.userId)

   // handle situations where prop item images updated after component mounted
   const primaryImage = computed(() => 
      props.item && (currItem.value.id == props.item.id) ? props.item.primaryImage : currItem.value.primaryImage)
   const childItems = computed(() => 
      props.item && (currItem.value.id == props.item.id) ? props.item.childItems : currItem.value.childItems)

   const artistOptions = computed(() => { 
      const options = []
      for (const artist of artistStore.artists) {
         const option = { title: artist.fullName, value: artist }
         options.push(option)
         if (currItem.value.primaryArtist?.id == option.value.id) { artistOption.value = option }
      }
      return options
   })

   const profiles = computed(() =>  [ ...profileStore.myProfiles ])

   const selectedGalleryIds = computed(() => selectedCheckboxIds(currItemGalleryCheckboxes.value))
   const selectedCheckboxIds = (checkboxes) => { 
      const ids = []
      for (const checkbox of checkboxes) {
         if (checkbox.selected) { ids.push(checkbox.id) }
      }
      return ids 
   }

   // computed vars to drive changes to component
   const galleryCheckboxes = computed(() => currItemGalleryCheckboxes.value) 
   
   const isItemGroup = (item) => { return item.type == ItemType.GROUP }
   
   const xsGalleriesOptions   = computed(() => galleryStore.myGalleries)
   const xsSelectedGalleryIds = computed(() => currItemGalleries.value.map(({id}) => id)) 
   const xsComputedGalleries  = computed({ 
      get() { return currItemGalleries.value },
      set(galleries) { currItemGalleries.value = sortByName(galleries) }
   })

   const save = () => {
      const existingGalleryIds = currItem.value.galleryIds ? currItem.value.galleryIds : []
      const updatedGalleryIds = xs.value ? [ ...xsSelectedGalleryIds.value ] : [ ...selectedGalleryIds.value ]
      
      const addItemToGalleries = []
      for (const galleryId of updatedGalleryIds) {
         if (!existingGalleryIds.includes(galleryId)) { addItemToGalleries.push(galleryId) }
      }

      const deleteItemFromGalleries = []
      for (const galleryId of existingGalleryIds) {
         if (!updatedGalleryIds.includes(galleryId)) { deleteItemFromGalleries.push(galleryId) }
      }
   
      const itemToUpdate = {
         id: currItem.value.id,
         name: currItemName.value,
         profileId: currProfileId.value,
         alternateName: currAltName.value,
         subtitle: currItemSubtitle.value,
         desc: currItemDescContainer.value.content,
         galleryIds: updatedGalleryIds,
         onUserWall: currItemWall.value
      }

      if (currItemState.value   != currItem.value.state)       { itemToUpdate.state = currItemState.value }
      if (currYearCreated.value != currItem.value.yearCreated) { itemToUpdate.yearCreated = currYearCreated.value }
      
      const artist = artistOption.value
      const primaryArtist = artist ? 
         { id: artist.value.id, name: artist.value.name, fullName: artist.value.fullName, allNames: artist.value.allNames } : null  
      if (primaryArtist && (!currItem.value.primaryArtist || currItem.value.primaryArtist.id != primaryArtist.id)) { 
         itemToUpdate.primaryArtist = primaryArtist }
      else if (!primaryArtist && currItem.value.primaryArtist) { itemToUpdate.primaryArtist = null }
      
      if (addItemToGalleries.length || deleteItemFromGalleries.length) {
         const contributingGalleryOwnerIds = []
         for (const gallery of galleryStore.myContributingGalleries ) {
            if (updatedGalleryIds.includes(gallery.id)) { contributingGalleryOwnerIds.push(gallery.userId) }
         }
         itemToUpdate.contributingGalleryOwnerIds = contributingGalleryOwnerIds
      }

      itemStore.updateItem(itemToUpdate)
      
      for (const galleryId of addItemToGalleries) { 
         const { id, primaryImage, otherImages } = currItem.value
         galleryStore.addItem(galleryId, { id, name: currItemName.value, primaryImage, otherImages }) 
      }

      for (const galleryId of deleteItemFromGalleries) { 
         // const dateContentModified = galleryMgr.latestOtherItemContentModified(galleryId, currItem.value.id)
         galleryMgr.removeItemId(galleryId, currItem.value.id) 
      }
       
      const wallIncludesItem = wallMgr.userWallIncludesItem(currItem.value.userId, currItem.value.id)
      if (currItemWall.value && !wallIncludesItem) {
      // if (currItemWall.value && !wallStore.myWallIncludesItem(currItem.value.id)) { 
         const itemForWall = { 
            id: currItem.value.id,
            name: currItemName.value,
            profileId: currProfileId.value,
            primaryImage: currItem.value.primaryImage, 
            primaryArtist: primaryArtist
         }
         // wallStore.addMyWallItem(itemForWall, currItem.value.primaryImage) 
         console.log("Adding wall item with primary image", itemForWall)
         wallStore.addWallItem(currItem.value.userId, itemForWall, currItem.value.primaryImage) 
      }
      else if (!currItemWall.value && wallIncludesItem) { 
         removeWallItem(currItem.value.id, currItem.value.userId)
      }

      // update wallItem.profileId if profile updated and item was already on wall
      if ((currProfileId.value != currItem.value.profileId) && wallIncludesItem && currItemWall.value) {
         console.log("Checking wallItem profileId")
         const wall = wallStore.myWall
         const updatedWallItems = []
         for (const wallItem of wall.wallItems) { 
            const wallItemToUpdate = { ...wallItem }
            if (wallItemToUpdate.itemId == currItem.value.id) { wallItemToUpdate.profileId = currProfileId.value }
            updatedWallItems.push(wallItemToUpdate)
         }
         wallStore.updateWall({ id: wall.id, wallItems: updatedWallItems })  
      }

      if (nextItems.value.length) { setCurrItem(nextItems.value.shift()) }
      else { emit(Emit.DONE) }
   }
</script>

<style>
.expansion { 
   margin: 0 20px 0 10px;  /* top right bottom left */
}
</style>
