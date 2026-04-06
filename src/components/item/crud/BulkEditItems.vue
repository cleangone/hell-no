<template>
   <v-card title="Bulk Edit Items" class="bulk-edit-items">
      <v-form>
         <v-row>
            <v-col><v-text-field v-model="namePrefix"   label="Add Name Prefix" class="ml-3"/></v-col>
            <v-col><v-combobox   v-model="artistOption" label="Artist" :items="artistOptions" compact class="mr-3"/></v-col>
         </v-row>
         <v-row class="mt-n7">
            <v-col><v-text-field v-model="nameFind"     label="Name Find"       class="ml-3"/></v-col>
            <v-col><v-text-field v-model="nameReplace"  label="Name Replace"    class="mr-3"/></v-col>
         </v-row>
         <v-row class="mt-n7">
            <v-col><v-select     v-model="itemState"    label="Visibility" :items="ItemStates" class="ml-3"/> </v-col>
            <v-col><v-text-field v-model="yearCreated"  label="Year Created" :rules="optionalYearRule" class="mr-2"/></v-col>
         </v-row>
         <div class="expansion">
            <v-expansion-panels multiple>
               <CheckboxExpansion type="Groups"    :checkboxes="groupCheckboxes"   class="mx-3"/>
               <CheckboxExpansion type="Galleries" :checkboxes="galleryCheckboxes" class="mx-3"/>
            </v-expansion-panels>
         </div>
      </v-form>
      <div style="min-height:75px"></div>
      <div class="float-bottom">  
         <v-btn @click="save()" :disabled="!dataEntered" color="primary" class="mr-4">save</v-btn>
         <v-btn @click="$emit(Emit.DONE)" color="primary">cancel</v-btn>
      </div>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGroupStore }   from '@/stores/groupStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useArtistStore }  from '@/stores/artistStore'
   import { useArtistMgr }    from '@/stores/artistMgr'
   import { useFeedMgr }      from '@/stores/feedMgr'
   import { useActionStore }  from '@/stores/ActionStore'
   import CheckboxExpansion from '@/components/util/CheckboxExpansion.vue'
   import { optionalYearRule } from '@/utils/utils'
   import { Emit, ItemStates } from '@/utils/constants'
   
   const props = defineProps({items: Array})
   const emit  = defineEmits([Emit.DONE])
   const itemStore    = useItemStore()
   const groupStore   = useGroupStore()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const artistStore  = useArtistStore()
   const artistMgr    = useArtistMgr()
   const feedMgr      = useFeedMgr()
   const actionStore  = useActionStore()
   const namePrefix  = ref(null)
   const nameFind    = ref('')
   const nameReplace = ref('')
   const itemState   = ref('')
   const yearCreated = ref(null)
   const artistOption = ref(null)
   const initialItemState    = ref('')
   const initialYearCreated  = ref(null)
   const initialArtistId     = ref(null)
   const initialSelectedGroupIds   = []
   const initialSelectedGalleryIds = []
   const itemGroups    = ref([])
   const itemGalleries = ref([])
   
   onMounted(() => {
      const stateValues = []
      const yearCreatedValues = new Set()
      const artistIds = []
      let primaryArtist = null
      for (const item of props.items) {
         if (!stateValues.includes(item.state)) { stateValues.push(item.state) }
         yearCreatedValues.add(item.yearCreated ? item.yearCreated : "" ) 
         if (item.primaryArtist) {
            if (!artistIds.includes(item.primaryArtist.id)) { 
               primaryArtist = item.primaryArtist
               artistIds.push(item.primaryArtist.id) }
         }  
         else { artistIds.push("0")}
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

      for (const item of props.items) {
         if (!stateValues.includes(item.state)) { stateValues.push(item.state) }
         if (item.primaryArtist) {
            if (!artistIds.includes(item.primaryArtist.id)) { 
               primaryArtist = item.primaryArtist
               artistIds.push(item.primaryArtist.id) }
         }  
         else { artistIds.push("0")}
      }

      const groups = []
      for (const group of groupStore.myGroups) {
         let selected = true
         for (const item of props.items) {
            if (!item.groupIds.includes(group.id)) { selected = false }
         }
         if (selected) { initialSelectedGroupIds.push(group.id) }
         groups.push( { id: group.id, name: group.name, selected: selected })
      } 
      itemGroups.value = groups
      
      const galleries = []
      for (const gallery of galleryStore.myGalleries) {
         let selected = true
         for (const item of props.items) {
            if (!item.galleryIds.includes(gallery.id)) { selected = false }
         }
         if (selected) { initialSelectedGalleryIds.push(gallery.id) }
         galleries.push( { id: gallery.id, name: gallery.name, selected: selected })
      }
      itemGalleries.value = galleries

      if (artistIds.length == 1) { 
         initialArtistId.value = artistIds[0] 
         // option.value diff than options, but title the same and all values have id
         artistOption.value = { title: primaryArtist.fullName, value: primaryArtist } 
      }
   })

   const artistOptions = computed(() => { return artistMgr.getArtistOptions(artistStore.myVisibleArtists) })
   
   const dataEntered = computed(() => { 
      return namePrefix.value ||
             nameFind.value.length ||
             itemState.value != initialItemState.value ||
             yearCreated.value != initialYearCreated.value ||
             (artistOption.value && artistOption.value.value.id != initialArtistId.value) ||
             JSON.stringify(selectedGroupIds.value)   != JSON.stringify(initialSelectedGroupIds) ||
             JSON.stringify(selectedGalleryIds.value) != JSON.stringify(initialSelectedGalleryIds)
   })

   const selectedGroupIds   = computed(() => selectedCheckboxIds(itemGroups.value))
   const selectedGalleryIds = computed(() => selectedCheckboxIds(itemGalleries.value))
   const selectedCheckboxIds = (checkboxes) => { 
      const ids = []
      for (const checkbox of checkboxes) {
         if (checkbox.selected) { ids.push(checkbox.id) }
      }
      return ids 
   }

   // computed vars to drive changes to component
   const groupCheckboxes   = computed(() => itemGroups.value)
   const galleryCheckboxes = computed(() => itemGalleries.value) 

   const save = () => {
      const addedGroupIds   = []
      const removedGroupIds = []
      if (JSON.stringify(selectedGroupIds.value) != JSON.stringify(initialSelectedGroupIds)) {
         for (const groupId of selectedGroupIds.value) {
            if (!initialSelectedGroupIds.includes(groupId)) { addedGroupIds.push(groupId) }
         }
         for (const groupId of initialSelectedGroupIds) {
            if (!selectedGroupIds.value.includes(groupId)) { removedGroupIds.push(groupId) }
         }
      }
      
      const addedGalleryIds   = []
      const removedGalleryIds = []
      if (JSON.stringify(selectedGalleryIds.value) != JSON.stringify(initialSelectedGalleryIds)) {
         for (const galleryId of selectedGalleryIds.value) {
            if (!initialSelectedGalleryIds.includes(galleryId)) { addedGalleryIds.push(galleryId) }
         }
         for (const galleryId of initialSelectedGalleryIds) {
            if (!selectedGalleryIds.value.includes(galleryId)) { removedGalleryIds.push(galleryId) }
         }
      }

      for (const item of props.items) {
         const itemToUpdate = { id: item.id }

         // add/remove groups
         if (addedGroupIds.length || removedGroupIds.length) {
            itemToUpdate.groupIds = [ ...item.groupIds ]
            for (const groupId of addedGroupIds) {
               if (!itemToUpdate.groupIds.includes(groupId)) { itemToUpdate.groupIds.push(groupId) }
            }
            for (const groupId of removedGroupIds) {
               const index = itemToUpdate.groupIds.indexOf(groupId)
               if (index != -1) { itemToUpdate.groupIds.splice(index, 1) }
            }
         }
         
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
     
         // apply name prefix if one specified ahd the item doesn't already start with it
         if (namePrefix.value && !item.name.startsWith(namePrefix.value)) {
            itemToUpdate.name = namePrefix.value + (namePrefix.value.endsWith(" ") ? "" : " ") + item.name 
         }

         if (nameFind.value.length) {
            if (!itemToUpdate.name) { itemToUpdate.name = item.name }
            itemToUpdate.name = itemToUpdate.name.replace(nameFind.value, nameReplace.value)
         }

         const selectedArtist = artistOption.value ? artistOption.value.value : null     
         if (selectedArtist && selectedArtist.id != initialArtistId.value) { 
            itemToUpdate.primaryArtist = artistMgr.getItemArtist(selectedArtist) 
         }

         const updatedItem = itemStore.updateItem(itemToUpdate)
         
         const updatedItemForFeed = feedMgr.createFeedItem(updatedItem, item)
         actionStore.addFeedAction(updatedItemForFeed, item)

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
