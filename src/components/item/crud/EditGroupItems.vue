<template>
   <v-card :title="title" class="edit-item-dialog">
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="close()"/>
      </template>
      
      <div v-if="showGroupItems">
         <div><TextButton text="Add Item" @click="showGroupItems=false" class="mx-3"/></div>
         <v-row class="d-flex justify-center ma-5">
            <draggable v-model="dragItems" item-key="id" class=" main">
               <template #item="{element}">
                  <div style="position: relative">
                     <img :src="element.primaryImage.thumbUrl" height="250" class="me-5" style="display: block"/>
                     <IconButton icon="mdi-close" @click="deleteItem(element.id)" density="comfortable" 
                        style="position:absolute; top:2px; right:22px;" class="bg-white"/>
                  </div>
                  </template>
            </draggable>
         </v-row>
         <div class="justify-center mx-5">
            <span v-for="(item, index) in dragItems" :key="item.id">
               <span v-if="index">, </span>{{ item.name }}
            </span>
         </div>
         <div class="mx-2">
            <v-checkbox v-for="container in visibleAddedItems" :key="container.item.id" v-model="container.setHidden" 
               :label="'Set ' + container.item.name + ' visibility to Hidden'" class="tight-checkbox"></v-checkbox>
         </div>
      </div>
      <AddGroupItem v-else :existingItemIds="existingItemIds" @item="addItem"/>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!itemsUpdated">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import draggable from 'vuedraggable'
   import { useItemStore } from '@/stores/itemStore'
   import AddGroupItem from './AddGroupItem.vue'
   import IconButton   from '@/components/util/IconButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import { isHidden } from '@/utils/utils'
   import { Emit, State } from '@/utils/constants'
   
   const props = defineProps({item: Object})
   const emit  = defineEmits([Emit.DONE])
   const itemStore = useItemStore()
   const showGroupItems = ref(true)
   const dragItems = ref([])
   const existingItemIds = ref([])
   const visibleAddedItems = ref([])
   
   onMounted(() => {
      dragItems.value = [ ...props.item.childItems ]
      existingItemIds.value = dragItems.value.map(a => a.id)
   })

   const title = computed(() => showGroupItems.value ? "Edit Group Items" : "Add Group Item")
   const close = () => { 
      if (showGroupItems.value) { emit(Emit.DONE) }
      else { showGroupItems.value = true }
   }   

   const addItem = (item) => { 
      if (!isHidden(item)) { visibleAddedItems.value.push({ setHidden: false, item: item }) }
      dragItems.value.push({
         id: item.id,
         name: item.name,
         primaryImage: item.primaryImage,
         primaryArtist: item.primaryArtist,
         dateModified: item.dateModified,
      })

      showGroupItems.value = true
   }
   
   const deleteItem = (id) => {
      for (var i=0; i<dragItems.value.length; i++) { 
         if (dragItems.value[i].id == id) { dragItems.value.splice(i, 1) }
      }
      
      for (var i=0; i<visibleAddedItems.value.length; i++) { 
         if (visibleAddedItems.value[i].item.id == id) { visibleAddedItems.value.splice(i, 1) }
      }
   }

   const itemsUpdated = computed(() => {
      if (dragItems.value.length != props.item.childItems.length) { return true }
      for (var i=0; i<dragItems.value.length; i++) { 
         if (dragItems.value[i].id != props.item.childItems[i].id) { return true }
      }
      return false
   })

   const save = () => {
      itemStore.updateItem({ id: props.item.id, childItems: [ ...dragItems.value ] })

      for (const container of visibleAddedItems.value) {
         if (container.setHidden) { itemStore.updateItem({ id: container.item.id, state:State.HIDDEN }) }
      }
      emit(Emit.DONE)
   }
</script>

<style>
</style>
