<template>
   <div class="text-left">
      <div class="text-left text-h6">
         <a @click="$emit(Emit.DONE)">Feeds</a> > {{ props.name }}
      </div>

      <v-data-table :headers="itemHeaders" :items="feedItems" item-key="id" :custom-key-sort="customKeySort">
         <template v-slot:item.dateModified="{ item }">{{ defaultDateString(item.dateModified)}}</template>
         <template v-slot:item.image="{ item }">
            <ItemGroupSmThumb v-if="isItemGroup(item)" :item="item" :height="40"/>
            <img v-else-if="item.primaryImage" :src="item.primaryImage.thumbUrl" height="40"/>
         </template>
         <template v-slot:item.actions="{ item }">
            <DeleteButton @click="deleteItem(item)"></DeleteButton>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showDeleteItemDialog" max-width="500px">
      <DeleteFeedItem :feedId="props.feedId" :feedItem="selectedItem" @done="showDeleteItemDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useFeedStore } from '@/stores/feedStore'
   import { useItemMgr }   from '@/stores/itemMgr'
   import ItemGroupSmThumb from '@/components/item/ItemGroupSmThumb.vue'
   import DeleteFeedItem   from '@/components/admin/DeleteFeedItem.vue'
   import DeleteButton     from '@/components/util/DeleteButton.vue'
   import { defaultDateString } from '@/utils/dateUtils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps(['feedId', 'name'])
   const emit = defineEmits([Emit.DONE])
   const feedStore = useFeedStore()
   const itemMgr = useItemMgr()
   const showDeleteItemDialog  = ref(false)
   const selectedItem = ref({})

   const itemHeaders = [
      { title: 'Modified', key: 'dateModified',                   align: 'center' },
      { title: 'Name',     key: 'name',          value: 'name' },
      { title: 'Image',                          value: 'image',  align: 'center' },
      { title: 'Artist',   key: 'primaryArtist', value: 'primaryArtist.fullName' },
      { title: '',         key: "actions" },
   ]

   const customKeySort = {
      dateModified: (a, b) => { return b - a },    
      name: (a, b) => { return a.localeCompare(b) }, 
      primaryArtist: (a, b) => { return a.name.localeCompare(b.name) } 
   } 

   const feed = computed(() => feedStore.getFeed(props.feedId))
   const feedItems = computed(() => feed.value ? feed.value.feedItems : [])
   const isItemGroup = (item) => { return itemMgr.isItemGroup(item)  }
   
   const deleteItem = (item) => { 
      selectedItem.value = item
      showDeleteItemDialog.value = true
   }
</script>

<style>
</style>
