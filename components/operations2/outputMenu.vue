<template>
  <v-dialog v-model="show">
        <v-layout row>

          <v-flex xs5 d-flex>
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
                    <td  class="px-12"><h2><input :min="row.amount-remainAmount" @change="changeTotal" type="number" :value="totalAmount"></input></h2></td>
                  </tr>

                </table>
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
                <tr :class="{dimmed: row.location.find(loc=>loc.adr==adr.adr)}" v-for="adr in $store.state.stock[row.articul]">
                  <td class="px-5 hand"  @click="addLocation(adr.adr,adr.amount)">{{adr.adr}}</td>
                  <td class="px-5">{{adr.amount}}</td>
                  <td class="px-5">{{row.location.find(loc=>loc.adr==adr.adr)?row.location.find(loc=>loc.adr==adr.adr).amount:null}}</td>
                </tr>
                <tr>
                  <td class="px-3"><v-select
                    :disabled="remainAmount==0" autocomplete item-text="adr" v-model="newLocation.address" :items="$store.state.stock[row.articul]">
                    <div class="px-3" slot="no-data">товара нет в наличии</div>
                  </v-select></td>
                  <td class="px-3"><v-text-field :disabled="remainAmount==0"  v-model="newLocation.amount" type="number" min="0">15</v-text-field></td>
                  <td><v-btn @click="addLocation(newLocation.address,parseInt(newLocation.amount))">Добавить</v-btn></td>
                </tr>
              </table>
              </v-card-text>
            </v-card>


          </v-flex>
<v-flex xs2 d-flex>
<v-card>
  <v-card-title>не отгружено</v-card-title>
  <v-card-text>
    <v-layout align-center justify-center>
      <v-flex><h1>{{remainAmount}}</h1></v-flex>
    </v-layout>
  </v-card-text>
</v-card>

</v-flex>

        </v-layout>
  </v-dialog>
</template>

<script>
  export default {
    name: "InputMenu",
      props:['index','inRow','inShow'],
      computed:{
        remainAmount(){
          return this.row.amount - this.row.location.reduce((a,b)=>a+b.amount,0)
        },
        totalAmount(){
                return this.row.amount
            },

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

changeTotal(i){
  if (i.target.value<this.row.amount-this.remainAmount||i.target.value<1)
      i.target.value=Math.max(this.row.amount-this.remainAmount,1)
    this.row.amount = i.target.value
    this.$emit('changed',this.remainAmount)
},
      addLocation(adr, amount){
    console.log('addLocation ',adr,amount)
        if(adr==''||amount<=0) return;
        if (this.row.location.find(loc=>loc.adr==adr)) {
          this.deleteLocation(adr);
          return;
          }
        if (this.remainAmount==0) return;
        console.log(this.remainAmount,amount)
          this.row.location.push({'adr':adr,'amount':this.remainAmount<amount?this.remainAmount:amount})
          this.$emit('changed',this.remainAmount)
      },
      

      deleteLocation(adr){
         this.row.remainAmount += Number.parseInt(this.row.location.find(a=>a.adr == adr ).amount)
         this.row.location.splice(this.row.location.findIndex(a=>a.adr == adr ),1)
          this.$emit('changed',this.remainAmount)
      }
    },
    mounted(){
      console.log('output menu mounted')
    },
    data(){
      return{
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
