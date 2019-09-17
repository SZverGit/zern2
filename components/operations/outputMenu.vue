<template>
  <v-dialog v-model="show" :attach="attachCSS">


        <v-layout row>
          <v-flex xs6 d-flex>
            <v-card>
              <v-card-text>

                <h2>{{index}}.</h2>
                <table>
                  <tr>
                    <td  class="px-3">Наименование</td>
                    <td  class="px-3">{{$store.state.supplyList[row.articul].name}}</td>
                  </tr>
                  <tr>
                    <td  class="px-3">TE</td>
                    <td  class="px-3">{{$store.state.supplyList[row.articul].TE}}</td>
                  </tr>
                  <tr>
                    <td  class="px-3">Количество</td>
                    <td  class="px-3"><v-text-field @input="$emit('changed')" type="number" v-model="row.amount"></v-text-field></td>
                  </tr>

                </table>
{{row}}
              </v-card-text>
            </v-card>
          </v-flex>





          <v-flex xs5 d-flex>
            <v-card>
              <v-card-text>
              <table>
                <tr>
                  <td>Адрес</td>
                  <td>На адресе</td>
                  <td>Отгружено</td>
                </tr>
                <tr  v-for="adr in $store.state.stock[row.articul]">
                  <td class="px-5" @click="addLocationOut(adr.adr,adr.amount)">{{adr.adr}}</td>
                  <td class="px-5">{{adr.amount}}</td>
                  <td class="px-5">{{row.location.find(loc=>loc.adr==adr.adr)?row.location.find(loc=>loc.adr==adr.adr).amount:undefined}}</td>

                </tr>
                <!--<tr v-if="row.amount > row.location.reduce((acc,cur)=>acc+=cur.amount,0)">-->
                <tr>
                  <td class="px-3"><v-select
                    :disabled="row.remainAmount==0" autocomplete item-text="adr" v-model="newLocation.address" :items="$store.state.stock[row.articul]">
                    <v-chip class="px-3" slot="no-data">нет такого адреса!</v-chip>
                  </v-select></td>
                  <td class="px-3"><v-text-field :disabled="row.remainAmount==0"  v-model="newLocation.amount" type="number" min="0">15</v-text-field></td>
                  <td><v-btn @click="addLocationOut(newLocation.address,newLocation.amount)">Добавить</v-btn></td>
                </tr>
              </table>
              </v-card-text>
            </v-card>


          </v-flex>

<v-flex xs1 d-flex>
<v-card>
  <v-card-title>Всего отгружено</v-card-title>
  <v-card-text>
    <v-layout align-center justify-center>
      <v-flex><h1>{{row.amount - row.remainAmount}}</h1></v-flex>
    </v-layout>
  </v-card-text>
</v-card>

</v-flex>





          <v-flex xs12 class="errors">
            <ul v-for="err in error">
              <li>{{err}}</li>
            </ul>
          </v-flex>



        </v-layout>

  </v-dialog>
</template>

<script>
  export default {
    name: "InputMenu",
    props:['index','inRow','inShow','attachCSS'],
    computed:{
   /* remainAmount2(){
        this.row.location.reduce((pr,cur)=>pr+=cur.amount,0)+this.newLocation.amount,row.amount
    }   ,*/
      row(){
        return this.inRow;
      },
      show:{
        get(){
          return this.inShow;
        },set(value){
          this.$emit('input')
        }

      }
    },
    methods:{
      addLocation(adr, amount){
        console.log('adr am ',adr,amount)
          if(adr==''||amount<=0) return;
        if (this.row.location.find(loc=>loc.adr==adr)) {
          this.deleteLocation(adr);return;
          }
        if (this.row.remainAmount==0) return;
          this.row.location.push({'adr':adr,'amount':this.row.remainAmount<amount?this.row.remainAmount:amount})
          this.row.remainAmount -= Number.parseInt(this.row.remainAmount<amount?this.row.remainAmount:amount)
          this.$emit('changed')
      },
      addLocation(row){
        console.log("ff2 =>",row)
        if (this.newLocation.amount<=0) {this.error.push('неверное кол-во в размещении');return}
        if (!this.newLocation.address) {this.error.push('не задан адрес размещения'); return}
        console.log('befoRe reduce .........../')
        console.log('aa2 => ',row.location.reduce((pr,cur)=>pr+=cur.amount,0)+this.newLocation.amount,row.amount)
        if (row.amount < row.location.reduce((acc,cur)=>acc+=cur.amount,0)+Number.parseInt(this.newLocation.amount)) {this.error.push('общее кол-во не бьется');return}

        if (row.location.findIndex(a=>a.adr==this.newLocation.address)==-1)
          row.location.push({adr:this.newLocation.address,amount:Number.parseInt(this.newLocation.amount)})
        else
          row.location.find(a=>a.adr==this.newLocation.address).amount += Number.parseInt(this.newLocation.amount);
        this.error = [];
        this.dirty = !this.dirty;
        console.log('emmitting chaaaang')
        this.$emit('changed')
      },

      deleteLocation(adr){
         this.row.remainAmount += Number.parseInt(this.row.location.find(a=>a.adr == adr ).amount)
         this.row.location.splice(this.row.location.findIndex(a=>a.adr == adr ),1)
          this.$emit('changed')
      }
    },

    data(){
      return{

        //row:{'location':[{'amount':0,'name':''}]},
        newLocation:{address:'',amount:0},
        error:[]
      }
    }
  }
</script>

<style scoped>
  .red-back{
    background-color: firebrick;
    text-align: center;
  }
  table,th,td{
    border: 2px solid #546E7A;
    border-collapse: collapse;
    width: 50%;
    /*background-color: ;*/
  }
  table{
    width: 100%;
  }
  td input{
    width:100%;
  }

  .errors{
    color:red;
  }

  .hand{
    cursor: pointer;
  }

  .dimmed{
    background-color: cadetblue;
  }

</style>
