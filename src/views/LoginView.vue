<template>
   <span v-if="!viewMgr.isMobile" class="title">Login</span>
   <div class="my-5 login text-left">
      <v-form v-model="dataValid">  
         <v-text-field v-model="email" label="Email" :rules="emailRule"></v-text-field>
         <v-text-field v-model="password" label="Password":type="showPassword?'text':'password'" 
            :append-inner-icon="showPassword?'mdi-eye-off':'mdi-eye'" @click:append-inner="showPassword=!showPassword"/>
      </v-form>
      <v-row justify="space-between">
         <v-btn @click="login()" :disabled="!dataValid || !password" class="ml-3">Login</v-btn>
         <TextButton @click="forgotPassword()" text="Forgot Password" :disabled="!dataValid" class="mt-1"/>
      </v-row>
   </div>
   <div class="login-info  pt-4">{{ infoMsg }}</div>
   <div class="login-error pt-4">{{ errMsg }}</div>
</template>

<script setup>
   import { ref } from 'vue'
   import { useRouter } from 'vue-router'
   import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth"
   import { useViewMgr } from '@/stores/viewMgr'
   import TextButton from '@/components/util/TextButton.vue'
   import { emailRule } from '@/utils/utils'
   import { Route } from '@/utils/constants'
   
   const router = useRouter()
   const viewMgr = useViewMgr()
   const email = ref("")
   const password = ref("")
   const showPassword = ref(false)
   const dataValid = ref(true)
   const infoMsg = ref("")
   const errMsg  = ref("")
   
   const login = () => {
      infoMsg.value = ""
      signInWithEmailAndPassword(getAuth(), email.value, password.value)
         .then((userCredential) => {
            email.value = ""
            password.value = ""
            errMsg.value = ""
            router.push(Route.HOME.url)
         })
         .catch((error) => {
            if (error.code == "auth/invalid-email") { errMsg.value = "Email invalid" }
            else if (error.code == "auth/user-not-found") { errMsg.value = "User not found" }
            else if (error.code == "auth/wrong=password") { errMsg.value = "Password incorrect" }
            else { errMsg.value = "Email/password incorrect" }
         })
   }

   const forgotPassword = () => {
      infoMsg.value = ""
      errMsg.value = ""
      sendPasswordResetEmail(getAuth(), email.value).then(() => {
         infoMsg.value = "Reset email sent"
      })
      .catch((error) => {
         console.error("sendPasswordResetEmail error", error.code, error.message)
         if (error.code == "auth/user-not-found") { errMsg.value = "Email not found" }
         else { errMsg.value = error.message }
      })
   }

</script>

<style>
   .login {
      margin: auto;
      width: 50%;
      min-width: 300px;
      max-width: 400px;
   }
   .login-info {
      color: blue;
      font-size: 20px;
   }
   .login-error {
      color: red;
      font-size: 20px;
   }
   
</style>
