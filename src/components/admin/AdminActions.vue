<template>
   <div class="text-left">
      <div class="text-h5">
         Actions
         <TextButton v-if="selectedIds.length" @click="deleteSelected()" text="Delete Selected"></TextButton>
         <span v-else>
            <TextButton @click="deleteOld()" text="Delete Old" :disabled="!actionsExist"></TextButton>
         </span>
      </div>
      <v-data-table :headers="headers" :items="actions" show-select v-model="selectedIds" 
            items-per-page="50" density="compact">
         <template v-slot:item.actionType="{ item }">
            <a v-if="isEmailAction(item)" @click="showAction(item)" class="pointer">{{ item.actionType }}</a>
            <span v-else>{{ item.actionType }}</span>
         </template>
         <template v-slot:item.dateCreated="{ item }">
            {{ item.dateCreated ? item.dateCreated.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.actions="{ item }">
            <DeleteButton @click="deleteAction(item)"></DeleteButton>
         </template>
      </v-data-table>
   </div>
   <v-dialog v-model="showViewDialog" width="auto" height="auto">
      <ViewAction :action="selectedAction" @done="showViewDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }   from '@/stores/userStore'
   import { useActionStore } from '@/stores/actionStore'
   import ViewAction   from '@/components/admin/ViewAction.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import { ActionType } from '@/utils/constants'

   const MIN_OLD_ITEMS_TO_KEEP = 10
   const userStore   = useUserStore()
   const actionStore = useActionStore()
   const selectedAction = ref(null)
   const selectedIds = ref([])
   const showViewDialog = ref(false)
   
   const headers = [
      { title: 'Type',      key: 'actionType',   value: 'actionType',   sortable: true },
      { title: 'Status',      value: 'actionStatus', sortable: true },
      { title: 'Created',   key: 'dateCreated',      sortable: true },
      { title: 'Username',    value: 'username',     sortable: true },
      { title: '',          key: "actions" },
   ]
   
   const actions = computed(() => { 
      const displayActions = []
      for (const action of actionStore.actions) {
         displayActions.push({ ...action, 
            username: action.userId ? userStore.getUsername(action.userId) : "" })
      }
      displayActions.sort(function(a, b){return b.dateCreated - a.dateCreated}) 
      return displayActions
   })
      
   const actionsExist = computed(() => actions.value.length > 0)
   const isEmailAction = (action) => { return action.actionType == ActionType.SEND_EMAIL }

   const showAction = (action) => { 
      selectedAction.value  = action 
      showViewDialog.value = true
   }

   const deleteAction = (action) => { logStore.deleteAction(action.id) }

   const deleteOld = () => { 
      const midnight = new Date().setHours(0, 0, 0)
      const idsToDelete = []
      const idsToKeep   = []
      for (const action of actions.value) {
         if (idsToKeep.length > MIN_OLD_ITEMS_TO_KEEP && action.dateCreated.toDate() < midnight) { 
            idsToDelete.push(action.id) }
         else { idsToKeep.push(action.id) }
      }
      actionStore.deleteActions(idsToDelete) 
   }
   
   const deleteSelected = () => { 
      actionStore.deleteActions(selectedIds.value) 
      selectedIds.value = []
   }
</script>

<style>
</style>
