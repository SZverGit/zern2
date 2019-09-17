<template>
    <v-container >
        <v-row  align="start" justify="center">
            <v-col align-self="center" cols="3">
                <v-text-field v-model="auth.usr" label="имя"></v-text-field>
                <v-text-field v-model="auth.pswd" type="password" label="пароль"></v-text-field>
            </v-col>
        </v-row>
        <v-row justify="center" @click="login" cols="4"><v-btn>Войти</v-btn></v-row>
    </v-container>
</template>

<script>
    export default {
        name: "LoginForm",
        data(){
          return{
              auth:{usr:'',
              pswd:''}
          }
        },
        methods:{
            login(){
                console.log('login=>',this.auth)
                this.$store.dispatch('login',this.auth).then(res=> console.log(res))
            }
        }
    }
</script>

<style scoped>

</style>