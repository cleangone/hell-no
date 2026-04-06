<template>
   <v-card :title="title" class="edit-dialog">
      <div class="text-left ml-3">
         <TextButton v-if="invitePerson" @click="invitePerson=false" text="Invite group of peope" />
         <TextButton v-else @click="invitePerson=true" text="Invite person" />
      </div>
      <v-form v-model="dataValid">
         <v-container class="text-left mx-2 invite-container">
            <v-text-field v-model="name" :label="nameLabel" :rules="requiredRule"/>
            <v-text-field v-if="invitePerson" v-model="email" label="Email" :rules="emailRule"/>   
            <v-select v-model="selectedGroupId" label="Initial group to join" :items="groupOptions" clearable :rules="requiredRule" density="compact"/>
         </v-container>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }   from '@/stores/userStore'
   import { useInviteStore } from '@/stores/inviteStore'
   import { useGroupMgr }    from '@/stores/groupMgr'
   import TextButton from '@/components/util/TextButton.vue'
   import { requiredRule, emailRule, randomPlate } from '@/utils/utils'
   import { Emit, InviteState, InviteType } from '@/utils/constants'
   
   const emit = defineEmits([Emit.DONE])

   const userStore   = useUserStore()
   const inviteStore = useInviteStore()
   const groupMgr  = useGroupMgr()
   const invitePerson = ref(true)
   const name = ref('')
   const email = ref('')
   const selectedGroupId = ref(null)
   const dataValid = ref(true)

   const inviteDesc = computed(() => invitePerson.value ? "Person" : "Group of People")
   const nameLabel  = computed(() => invitePerson.value ? "First name" : "Group name")
   const title = computed(() => "Invite " + inviteDesc.value + " to Join Site")
   const groupOptions = computed(() => groupMgr.myGroupOptions)

   const save = () => {
      const initialGroup = groupMgr.groupIdToMyGroup.get(selectedGroupId.value)
      const invite = { 
         type: InviteType.SITE, 
         state: InviteState.CREATED,
         fromUserId: userStore.userId,
         fromUserFullName: userStore.myFullName,
         groupId: selectedGroupId.value,
         groupName: initialGroup.name,
         registerId: randomPlate()
      }

      // backend sends email if toEmail set
      if (invitePerson.value) {
         invite.toEmail = email.value
         invite.toFirstName = name.value
      }
      else {
         invite.toGroupName = name.value
      }

      inviteStore.addInvite(invite)

      emit(Emit.DONE)
   }
</script>

<style>
.invite-container {
   min-height: 250px;  
}
</style>
