<template>
   <v-card v-if="edit==Edit.ITEM" title="Edit Item" class="edit-item-dialog">
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)"/>
      </template>
      <div v-if="isSingleItem"><TextButton text="Edit Images" @click="edit=Edit.IMAGE" class="mx-3"/></div>
      <div v-if="isGroupItem"><TextButton text="Edit Grouped Items" @click="edit=Edit.GROUPED_ITEMS" class="mx-3"/></div>
      <EditItem :item="item" :items="props.items" @done="$emit(Emit.DONE)"/>
   </v-card>
   <EditImages     v-else-if="edit==Edit.IMAGE"         :item="item" @done="edit=Edit.ITEM" class="edit-item-dialog"/>
   <EditGroupItems v-else-if="edit==Edit.GROUPED_ITEMS" :item="item" @done="edit=Edit.ITEM" class="edit-item-dialog"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemStore } from '@/stores/itemStore'
   import EditItem       from './EditItem.vue'
   import EditImages     from './EditImages.vue'
   import EditGroupItems from './EditGroupItems.vue'
   import IconButton from '@/components/util/IconButton.vue'
   import TextButton from '@/components/util/TextButton.vue'
   import { Emit, ItemType } from '@/utils/constants'
   
   const Edit = { ITEM: "item", IMAGE: "image", GROUPED_ITEMS: "groupedItems" }
   const props = defineProps({ 
      item: Object, // edit one item
      items: Array  // edit multiple items one at a time
   })
   const emit  = defineEmits([ Emit.DONE ])
   const itemStore = useItemStore()
   
   const item = computed(() => { return props.item ? itemStore.itemIdToItem.get(props.item.id) : props.item })

   const edit = ref(Edit.ITEM)
   const isSingleItem = computed(() => props.item && props.item.type == ItemType.SINGLE)
   const isGroupItem  = computed(() => props.item && props.item.type == ItemType.GROUP)
</script>

<style>
.edit-item-dialog {
   width: 900px;
   min-height: 500px;
}
</style>
