<template>
   <v-card title="Add This Device" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-text-field v-model="name" label="Name" :rules="requiredRule" class="ma-3"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useDeviceStore } from '@/stores/deviceStore'
   import { useViewStore }   from '@/stores/viewStore'
   
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps([ 'userId' ])
   const emit = defineEmits([Emit.DONE]);

   const deviceStore = useDeviceStore()
   const viewStore   = useViewStore()
   const name = ref('')
   const dataValid = ref(true)
   
   const deviceId = computed(() => viewStore.deviceId )

   const save = () => {
      console.log("save", deviceId.value)
      deviceStore.setDevice({ id: deviceId.value, name: name.value, userId: props.userId })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
