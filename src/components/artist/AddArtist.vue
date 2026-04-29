<template>
   <v-card title="Add Artist" class="edit-dialog">
      <v-form v-model="dataValid">
         <v-container>
            <v-row>
               <v-col class="pl-4">
                  <v-text-field v-model="firstName" label="First name" />
                  <v-text-field v-model="name" label="Last name/name (Smith, BWS)" :rules="requiredRule"/>
                  <v-combobox v-model="akaFor" label="AKA" :items="primaryArtists" compact />
                </v-col>
               <v-col class="pr-4">
                  <v-text-field v-model="middleName" label="Middle name/initial"/>
                  <v-text-field v-model="sortName" label="Sort name (if diff than name)"/>
                  <div>(Barry Windsor-Smith and BWS are both AKAs for Barry Smith)</div>
               </v-col>
            </v-row>
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
   import { useArtistStore } from '@/stores/artistStore'
   import { useArtistMgr }   from '@/stores/artistMgr'
   import { requiredRule } from '@/utils/utils'
   import { ActionType, ArtistState, Emit } from '@/utils/constants'
   
   const emit = defineEmits([Emit.DONE])

   const userStore = useUserStore()
   const artistStore = useArtistStore()
   const artistMgr = useArtistMgr()
   const firstName = ref('')
   const middleName = ref('')
   const name = ref(null)
   const sortName = ref('')
   const akaFor = ref()
   const dataValid = ref(true)
   
   const primaryArtists = computed(() => artistMgr.getPrimaryArtistsForAKA())

   const save = () => {
      // console.log("akaFor", akaFor.value ?  akaFor.value : "")
      // console.log("state", akaFor.value ? ArtistState.AKA  : ArtistState.PRIMARY)
      const fullName = artistMgr.getFullName(firstName.value, middleName.value, name.value)
      const akaPrimaryId = akaFor.value ? akaFor.value.value.id : null

      artistStore.addArtist({ 
         firstName: firstName.value, 
         middleName: middleName.value, 
         name: name.value, 
         fullName: fullName,
         sortName: sortName.value.length ? sortName.value : name.value,
         state: akaPrimaryId ? ArtistState.AKA  : ArtistState.PRIMARY,
         akaForId: akaPrimaryId ? akaPrimaryId : "",
         allNames: fullName,
         userId: userStore.userId,
         action: akaPrimaryId ? ActionType.PROCESS : "" 
      })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
