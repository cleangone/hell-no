<template>
   <v-card title="Bulk Edit Items" class="bulk-edit-items">
      <v-form>
         <v-row no-gutters>
            <v-col><v-text-field v-model="namePrefix" label="Add Name Prefix" class="ml-3"/></v-col>
            <v-col><v-select     v-model="itemState"  label="Item State" :items="ItemStates" class="mx-3"/></v-col>
         </v-row>
         <v-row no-gutters class="mt-n3">
            <v-col><v-text-field v-model="nameFind"    label="Name Find"    class="ml-3"/></v-col>
            <v-col><v-text-field v-model="nameReplace" label="Name Replace" class="mx-3"/></v-col>
         </v-row>
         <v-row class="mt-n7">
            <v-col cols="12"><EditArtist :artistContainer="primaryArtistContainer" class="mx-3"/></v-col>
         </v-row>
         <v-row no-gutters class="mt-2">
            <v-col><v-select v-model="profileId" label="Owned by Profile" :items="profiles" item-title="username" item-value="id" clearable class="ml-3"/></v-col>
            <v-col><v-text-field v-model="yearCreated" label="Year Created" :rules="optionalYearRule" class="mx-3"/></v-col>
         </v-row>
         <div class="expansion">
            <EditArtists title="Other Artists" :artistContainers="otherArtistsContainers"/>
            <v-expansion-panels multiple>
               <CheckboxExpansion type="Galleries" :checkboxes="galleryCheckboxes" class="mx-3"/>
            </v-expansion-panels>
         </div>
      </v-form>
      <div style="min-height:75px"></div>
      <div class="float-bottom">  
         <v-btn @click="save()" color="primary" class="mr-4">save</v-btn>
         <v-btn @click="$emit(Emit.DONE)" color="primary">cancel</v-btn>
      </div>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useArtistMgr }    from '@/stores/artistMgr'
   import { useProfileStore } from '@/stores/profileStore'
   import EditArtist          from './EditArtist.vue'
   import EditArtists         from './EditArtists.vue'
   import CheckboxExpansion from '@/components/util/CheckboxExpansion.vue'
   import { optionalYearRule } from '@/utils/utils'
   import { Emit, ItemStates } from '@/utils/constants'
   
   import { dequal } from 'dequal';
   
   const props = defineProps({items: Array})
   const emit  = defineEmits([Emit.DONE])
   const itemStore    = useItemStore()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const artistMgr    = useArtistMgr()
   const profileStore = useProfileStore()
   const namePrefix  = ref(null)
   const nameFind    = ref('')
   const nameReplace = ref('')
   const itemState   = ref('')
   const yearCreated = ref(null)
   const primaryArtistContainer = ref(artistMgr.defaultArtistContainer) 
   const otherArtistsContainers = ref([]) 
   const profileId   = ref(null)
   const initialItemState   = ref('')
   const initialProfileId   = ref(null)
   const initialPrimaryArtist = ref(null) 
   const initialOtherArtists  = ref(null) 
   const initialYearCreated   = ref(null)
   const initialSelectedGalleryIds = ref([])
   const itemGalleryCheckboxes = ref([])
   
   onMounted(() => {
      const stateValues = []
      const profileIdValues = []
      const yearCreatedValues = new Set()
      let commonGalleryIds = null
      for (const item of props.items) {
         if (!stateValues.includes(item.state)) { stateValues.push(item.state) }
         yearCreatedValues.add(item.yearCreated ? item.yearCreated : "" ) 
         
         if (item.primaryArtist && !initialPrimaryArtist.value) { 
            initialPrimaryArtist.value = { ...item.primaryArtist }
            primaryArtistContainer.value = artistMgr.getArtistContainer(item.primaryArtist) 
         }

         if (item.otherArtists && !initialOtherArtists.value) { 
            initialOtherArtists.value = [ ...item.otherArtists ]
            otherArtistsContainers.value = artistMgr.getArtistContainers(item.otherArtists) 
         }

         const profileId = item.profileId ? item.profileId : ""
         if (!profileIdValues.includes(profileId)) { profileIdValues.push(profileId) }

         const itemGalleryIds = item.galleryIds ?? []
         if (commonGalleryIds && commonGalleryIds.size) {
            const commonIdsToDelete = []
            for (const commonId of commonGalleryIds) {
               if (!itemGalleryIds.includes(commonId)) { commonIdsToDelete.push(commonId) }
            }
            commonIdsToDelete.forEach(id => commonGalleryIds.delete(id))
         }
         else if (!commonGalleryIds) { commonGalleryIds = new Set(itemGalleryIds) }
      }

      if (stateValues.length == 1) { 
         initialItemState.value = stateValues[0] 
         itemState.value = stateValues[0] 
      }

      if (yearCreatedValues.size == 1) { 
         const commonValue = yearCreatedValues.values().next().value
         if (commonValue != "") {
            initialYearCreated.value = commonValue
            yearCreated.value = commonValue 
         }
      }

      if (profileIdValues.length == 1 && profileIdValues[0].length) { 
         initialProfileId.value = profileIdValues[0] 
      }
      
      const galleryCheckboxContainer = galleryMgr.getCheckboxes([ ...commonGalleryIds ])
      itemGalleryCheckboxes.value = galleryCheckboxContainer.checkboxes
      initialSelectedGalleryIds.value = galleryCheckboxContainer.selectedGalleries.map(gallery => gallery.id)
   })

   const profiles = computed(() => { 
      const profiles = [ ...profileStore.myProfiles ]
      for (const profile of profiles) {
         if (initialProfileId.value == profile.id) { profileId.value = profile.id }
      }
      return profiles
   })

   const selectedCheckboxIds = (checkboxes) => { 
      const ids = []
      for (const checkbox of checkboxes) {
         if (checkbox.isSelected) { ids.push(checkbox.id) }
      }
      return ids 
   }

   // computed var to drive changes to component
   const galleryCheckboxes = computed(() => itemGalleryCheckboxes.value) 

   const save = () => { 
      const addedGalleryIds   = []
      const removedGalleryIds = []
      const selectedGalleryIds = selectedCheckboxIds(itemGalleryCheckboxes.value)
      if (!dequal(selectedGalleryIds, initialSelectedGalleryIds.value)) {
         console.log("galleries changed", selectedGalleryIds)
         for (const galleryId of selectedGalleryIds) {
            if (!initialSelectedGalleryIds.value.includes(galleryId)) { addedGalleryIds.push(galleryId) }
         }
         for (const galleryId of initialSelectedGalleryIds.value) {
            if (!selectedGalleryIds.includes(galleryId)) { removedGalleryIds.push(galleryId) }
         }
      }

      for (const item of props.items) {
         const itemToUpdate = { id: item.id }
         
         // add/remove galleries
         if (addedGalleryIds.length || removedGalleryIds.length) {
            itemToUpdate.galleryIds = [ ...item.galleryIds ]
            for (const galleryId of addedGalleryIds) {
               if (!itemToUpdate.galleryIds.includes(galleryId)) { itemToUpdate.galleryIds.push(galleryId) }
            }
            for (const galleryId of removedGalleryIds) {
               const index = itemToUpdate.galleryIds.indexOf(galleryId)
               if (index != -1) { itemToUpdate.galleryIds.splice(index, 1) }
            }
         }

         if (itemState.value   != initialItemState.value)   { itemToUpdate.state       = itemState.value }                       
         if (yearCreated.value != initialYearCreated.value) { itemToUpdate.yearCreated = yearCreated.value }                       
     
         // apply name prefix if one specified and the item doesn't already start with it
         if (namePrefix.value && !item.name.startsWith(namePrefix.value)) {
            itemToUpdate.name = namePrefix.value + (namePrefix.value.endsWith(" ") ? "" : " ") + item.name 
         }

         if (nameFind.value.length) {
            if (!itemToUpdate.name) { itemToUpdate.name = item.name }
            itemToUpdate.name = itemToUpdate.name.replace(nameFind.value, nameReplace.value)
         }

         if (!dequal(profileId.value, initialProfileId.value)) { 
            itemToUpdate.profileId = profileId.value 
         }

         const primaryArtist = artistMgr.getArtistFromContainer(primaryArtistContainer.value)
         if (!dequal(primaryArtist, initialPrimaryArtist.value)) {
            console.log("setting itemToUpdate.primaryArtist", primaryArtist)
            itemToUpdate.primaryArtist = primaryArtist 
         }  

         const otherArtists = artistMgr.getArtistsFromContainers(otherArtistsContainers.value)
         if (!dequal(otherArtists, initialOtherArtists.value)) {
            console.log("setting itemToUpdate.otherArtists", otherArtists)
            itemToUpdate.otherArtists = otherArtists 
         }  

         itemStore.updateItem(itemToUpdate)
         
         for (const galleryId of addedGalleryIds) { 
            const { id, name, primaryImage, otherImages } = item
            galleryStore.addItem(galleryId, { id, name, primaryImage, otherImages }) 
         }

         for (const galleryId of removedGalleryIds) { 
            galleryMgr.removeItemId(galleryId, item.id) 
         }
      }

      emit(Emit.DONE)
   }
</script>

<style>
.bulk-edit-items {
   min-width:  600px;
   min-height: 500px;
}
.expansion { 
   margin: 0 10px 0 10px;  /* top right bottom left */
}
</style>
