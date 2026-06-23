<template>
   <v-card title="Add Artist" class="edit-dialog">
      <v-form v-model="dataValid">
         <v-container>
            <v-row>
               <v-col><v-text-field v-model="firstName" label="First name"/></v-col>
               <v-col class="ml-n3">
                   <v-tooltip text="Last name or moniker (ie. BWS)" location="end">
                     <template v-slot:activator="{ props }">
                        <v-text-field v-bind="props" v-model="name" label="Last name/name" :rules="requiredRule"/>
                     </template>
                  </v-tooltip>
               </v-col>
            </v-row>
            <v-row class="mt-n8"> 
               <v-col><v-text-field v-model="middleName" label="Middle name/initial"/></v-col>
               <v-col class="ml-n3">
                  <v-tooltip text="Used for small thumbnails. Defaults to name" location="end">
                     <template v-slot:activator="{ props }">
                        <v-text-field v-bind="props" v-model="shortName" label="Short name"/>
                     </template>
                  </v-tooltip>
               </v-col>
            </v-row>
            <v-row class="mt-n8"> 
               <v-col>
                  <v-tooltip text="Ex. Barry Windsor-Smith and BWS are both AKAs for Barry Smith" location="end">
                     <template v-slot:activator="{ props }">
                        <v-combobox v-bind="props" v-model="akaFor" label="AKA" :items="primaryArtists" compact/>                 
                     </template>
                  </v-tooltip>
               </v-col>
               <v-col class="ml-n3">
                   <v-tooltip text="Defaults to name" location="end">
                     <template v-slot:activator="{ props }">
                        <v-text-field v-bind="props" v-model="sortName" label="Sort name"/>
                     </template>
                  </v-tooltip>
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
   const firstName  = ref('')
   const middleName = ref('')
   const name       = ref(null)
   const shortName  = ref('')
   const sortName   = ref('')
   const akaFor     = ref()
   const dataValid  = ref(true)
   
   const primaryArtists = computed(() => artistMgr.getPrimaryArtistsForAKA())

   const save = () => {
      const fullName = artistMgr.getFullName(firstName.value, middleName.value, name.value)
      const akaPrimaryId = akaFor.value ? akaFor.value.value.id : null
      artistStore.addArtist({ 
         firstName: firstName.value, 
         middleName: middleName.value, 
         name: name.value, 
         fullName: fullName,
         shortName: shortName.value.length ? shortName.value : name.value,
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
