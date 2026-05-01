<template>
   <div class="text-left">
      <div class="text-h5">
         Invites
         <TextButton @click="showAddGroupInviteDialog=true" text="Create Group Invite"/>
         <TextButton @click="showAddSiteInviteDialog=true"  text="Create Site Invite" />
      </div>

      <v-data-table :headers="headers" :items="invites" :custom-key-sort="customKeySort"  
            v-model:expanded="expandedInviteIds" density="compact">
         <template v-slot:item.to="{ item }">
            {{ item.toFirstName ? item.toFirstName : item.toGroupName }}
         </template>
         <template v-slot:item.link="{ item }">
            <RouterLink v-if="item.type == InviteType.SITE && item.state != InviteState.ACCEPTED" 
               :to="Route.REGISTER.url + item.registerId">Register Link</RouterLink>
         </template>
         <template v-slot:item.dateCreated="{ item }">
            {{ item.dateCreated ? item.dateCreated.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.state="{ item }">
            <div v-if="item.toFirstName || item.acceptances.length == 0">{{ item.state }}</div>
            <div v-else-if="item.state == InviteState.CREATED">
               {{ item.acceptances.length }} {{ item.acceptances.length == 1 ? "Acceptance" : "Acceptance" }}
               <IconButton v-if="expandedInviteIds.includes(item.id)" @click="contractInvite(item.id)" icon="mdi-chevron-up"/>
               <IconButton v-else @click="expandInvite(item.id)" icon="mdi-chevron-down"/>
            </div>
         </template>
         <template v-slot:item.actions="{ item }">
            <DeleteButton @click="deleteInvite(item)"></DeleteButton> 
         </template>
         <template v-slot:expanded-row="{ columns, item }">
            <tr v-for="acceptance in item.acceptances">
               <td v-for="col in columns">
                  <div v-if="col.key=='to'"> {{ acceptance.firstName }}</div>
                  <div v-else-if="col.key=='toEmail'">{{ acceptance.email }}</div>
               </td>
            </tr>
         </template>
         <template v-slot:no-data>
            No invites
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showAddGroupInviteDialog" width="auto">
      <AddGroupInvite @done="showAddGroupInviteDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showAddSiteInviteDialog" width="auto">
      <AddSiteInvite @done="showAddSiteInviteDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteInvite :invite="selectedInvite" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useInviteStore }  from '@/stores/inviteStore'
   import AddGroupInvite from '@/components/invite/AddGroupInvite.vue'
   import AddSiteInvite  from '@/components/invite/AddSiteInvite.vue'
   import DeleteInvite   from '@/components/invite/DeleteInvite.vue'
   import DeleteButton   from '@/components/util/DeleteButton.vue'
   import IconButton     from '@/components/util/IconButton.vue'
   import TextButton     from '@/components/util/TextButton.vue'
   import { removeArrayEntry } from '@/utils/utils'
   import { InviteState, InviteType, Route } from '@/utils/constants'
   
   const inviteStore = useInviteStore()
   const expandedInviteIds = ref([]) 
   const showAddGroupInviteDialog = ref(false)
   const showAddSiteInviteDialog = ref(false)
   const showDeleteDialog = ref(false)
   const selectedInvite = ref({})
   
   const headers = [
      { title: 'Type',    key: 'type',        value: 'type' },
      { title: 'To',      key: 'to' },
      { title: 'Email',   key: 'toEmail',     value: 'toEmail' },
      { title: 'Initial Group',               value: 'groupName',   align: 'center' },
      { title: 'Link',    key: 'link',                              align: 'center' },
      { title: 'Invited', key: 'dateCreated', value: 'dateCreated', align: 'center' },
      { title: 'Status',  key: 'state',                             align: 'center' },
      { title: '', key: "actions" },
   ]

   const customKeySort = {
      type:        (a, b) => { return a.localeCompare(b) }, 
      to:          (a, b) => { return a.localeCompare(b) }, 
      toEmail:     (a, b) => { return a.localeCompare(b) }, 
      dateCreated: (a, b) => { return b - a }, 
   } 
      
   const invites = computed(() => inviteStore.myInvites)
   
   const expandInvite = (inviteId) => { expandedInviteIds.value.push(inviteId) }
   const contractInvite = (inviteId) => { arrayRemove(expandedInviteIds.value, inviteId) }

   const deleteInvite = (invite) => {
      selectedInvite.value = invite
      showDeleteDialog.value = true
   }
</script>

<style>
</style>
