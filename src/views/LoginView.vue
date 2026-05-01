<template>
   <h1>Login</h1>
   <v-form v-model="dataValid" class="mt-2 login">  
      <v-text-field v-model="email" label="Email" :rules="requiredRule"></v-text-field>
      <v-text-field :type="showPassword?'text':'password'" v-model="password" label="Password" :rules="requiredRule"
         :append-inner-icon="showPassword?'mdi-eye-off':'mdi-eye'" @click:append-inner="showPassword=!showPassword"/>
   </v-form>
   <v-btn @click="login()" :disabled="!dataValid">Login</v-btn>
   
   <div class="error pt-4">{{ errMsg }}</div>
</template>

<script setup>
   import { ref } from 'vue'
   import { useRouter } from 'vue-router'
   import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
   import { requiredRule } from '@/utils/utils'
   import { Route } from '@/utils/constants'
   
   const router = useRouter()
   const email = ref("")
   const password = ref("")
   const errMsg = ref("")
   const showPassword = ref(false)
   const dataValid = ref(true)
   
   const login = () => {
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
</script>

<style>
   .login {
      margin: auto;
      width: 50%;
   }
   .error {
      color: red;
      font-size: 20px;
   }
</style>
