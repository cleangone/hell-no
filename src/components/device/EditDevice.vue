<template>
   <v-card title="Edit Device" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-text-field v-model="name" label="Name" :rules="requiredRule" class="ma-3"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useDeviceStore } from '@/stores/deviceStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ device: Object })
   const emit  = defineEmits([ Emit.DONE ])
   const deviceStore = useDeviceStore()
   const name = ref('')
   const dataValid = ref(true)
   
   onMounted(() => {
      name.value = props.device.name
   })
   
   const save = () => { 
      deviceStore.updateDevice({ id: props.device.id, name: name.value })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
