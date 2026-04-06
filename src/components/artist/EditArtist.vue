<template>
   <v-card title="Edit Artist" class="edit-dialog">
      <v-form v-model="dataValid">
         <v-container>
            <v-row>
               <v-col class="pl-4">
                  <v-text-field v-model="firstName" label="First name" />
                  <v-text-field v-model="name" label="Last name/name" :rules="requiredRule"/>
                  <v-combobox v-model="akaFor" label="AKA" :items="primaryArtists" clearable compact />
                </v-col>
               <v-col class="pr-4">
                  <v-text-field v-model="middleName" label="Middle name/initial"/>
                  <v-text-field v-model="sortName" label="Sort name" :rules="requiredRule"/>
               </v-col>
            </v-row>
         </v-container>
      </v-form>
      <v-card-actions class="justify-end mt-5">
         <v-btn @click="save()" :disabled="!dataValid" color="primary">Save</v-btn>
         <v-btn @click="$emit(Emit.DONE)" color="primary">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useArtistStore } from '@/stores/artistStore'
   import { useArtistMgr }   from '@/stores/artistMgr'
   import { requiredRule } from '@/utils/utils'
   import { ActionType, ArtistState, Emit } from '@/utils/constants'
   
   const props = defineProps({ artist: Object })
   const emit = defineEmits([Emit.DONE])

   const artistStore = useArtistStore()
   const artistMgr = useArtistMgr()
   const firstName = ref('')
   const middleName = ref('')
   const name = ref('')
   const sortName = ref('')
   const akaFor = ref()
   const dataValid = ref(true)
   
   onMounted(() => {
      firstName.value = props.artist.firstName
      middleName.value = props.artist.middleName
      name.value = props.artist.name
      sortName.value = props.artist.sortName

      if (props.artist.akaForId) {
         const akaArtist = artistMgr.myVisibleArtistIdToArtist.get(props.artist.akaForId)
         akaFor.value = { title: akaArtist.fullName, value: akaArtist }
      }
   })
   
   const primaryArtists = computed(() => artistMgr.getPrimaryArtistsForAKA(props.visibility))

   const save = () => {
      const fullName = artistMgr.getFullName(firstName.value, middleName.value, name.value)
      const akaPrimaryId = akaFor.value ? akaFor.value.value.id : null

       artistStore.updateArtist({
         id: props.artist.id,
         firstName: firstName.value,
         middleName: middleName.value,
         name: name.value,
         fullName: fullName,
         sortName: sortName.value,
         state: akaPrimaryId ? ArtistState.AKA : ArtistState.PRIMARY,
         akaForId: akaPrimaryId ? akaPrimaryId : "",
         allNames: fullName,
         action: akaPrimaryId || artistMgr.hasAKAs(props.artist.id) ? ActionType.PROCESS : "" 
      })
   
      emit(Emit.DONE)
   }

</script>

<style>
</style>
