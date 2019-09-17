<template>
  <v-app>

    <!--<v-navigation-drawer app></v-navigation-drawer>-->

    <v-app-bar  class="no-print" app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Zern</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <router-link :to="{name:'operations'}"><v-btn text>Операции</v-btn></router-link>
      <router-link :to="{name:'supplyList'}"><v-btn text>Товары</v-btn></router-link>
      <router-link :to="{name:'stock'}"><v-btn text>Сток</v-btn></router-link>
      <router-link :to="{name:'info'}"><v-btn text>Инфо</v-btn></router-link>

    </v-app-bar>

    <v-content>
      <v-container>
      <router-view :operation="$store.state.current_operation" @Message="showMessage"></router-view>
      <v-snackbar multi-line v-model="snackbar"><v-alert v-if="message" :value="true" :type=messageType><span v-html="message"></span></v-alert></v-snackbar>
      </v-container>
    </v-content>


  </v-app>
</template>

<script>



    export default {
        name: 'App',
        methods:{
            showMessage(msgJson){
                this.snackbar = true;
                this.message += (this.message?'<br>':'') + msgJson.msg;
                this.messageType = msgJson.type
                clearTimeout(this.timer);
                this.timer = setTimeout(()=>{this.message='';this.snackbar=false},3000)
            },
            resetDoor1(){
                console.log('reset door 1')
                this.$store.commit('change1');
            }
        },
        data () {
            return {
                snackbar:false,
                message:'',
                messageType:'error',
                timer:null,
                testDate:'2019-06-16T21:57:45.605Z',
                rows:[{name:'дверь1',amount:3},{name:'решетка2',amount:12},{name:'канал3',amount:10},{name:'дверь4',amount:33},{name:'решетка5',amount:120},{name:'канал6',amount:250},
                    {name:'дверь1',amount:3},{name:'решетка2',amount:12},{name:'канал3',amount:10},{name:'дверь4',amount:33},{name:'решетка5',amount:120},{name:'канал6',amount:250}]
            }
        }
    }
</script>

<style scoped>
  @media print
  {
    .no-print, .no-print *
    {
      display: none !important;
    }
  }
</style>