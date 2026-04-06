<template>
   <v-card title="Add Channel" class="edit-dialog">
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
   import { ref } from 'vue'
   import { useChannelStore } from '@/stores/channelStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps(['userId'])
   const emit = defineEmits([Emit.DONE]);

   const channelStore = useChannelStore()
   const name = ref('')
   const dataValid = ref(true)
   
   const save = () => {
      channelStore.addChannel({ name: name.value, active: true, userId: props.userId })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
