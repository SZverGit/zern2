<template>
  <v-dialog v-model="show" :attach="attachCSS">
    <v-card>
      <v-card-text>
        <v-layout row wrap>
          <v-flex xs1>
            {{index}}.
          </v-flex>
          <v-flex xs3>
            <!--{{$store.state.supplyList.find(s=>s.articul==row.articul).name}}-->
            {{$store.state.supplyList[row.articul].name}}
          </v-flex>

          <v-flex xs2>
            {{$store.state.supplyList[row.articul].TE}}
          </v-flex>

          <v-flex xs1>

            <v-text-field @change="$emit('changed')" type="number" v-model="row.amount"></v-text-field>
          </v-flex>

          <v-spacer></v-spacer>



          <v-flex xs4>
            <table>
              <tr v-for="loc in row.location">
                <td class="px-2">{{loc.adr}}</td>
                <td class="px-2">{{loc.amount}}</td>
                <td @click="deleteLocation(row,loc.adr)" class="red-back hand"><v-icon   color="black" size="small">close</v-icon></td>
              </tr>
              <tr v-show="row.amount > row.location.reduce((acc,cur)=>acc+=cur.amount,0)">
                <!--td class="px-3"><v-combobox item-text="name" v-model="newLocation.address" :items="$store.state.addressList"></v-combobox>-->
                <td class="px-3"><v-select autocomplete item-text="name" v-model="newLocation.address" :items="$store.state.addressList">
                  <v-chip class="px-3" slot="no-data">нет такого адреса!</v-chip>
                </v-select></td>
                <td class="px-3"><v-text-field  v-model="newLocation.amount" type="number" min="0">15</v-text-field></td>
                <td><v-btn @click="addLocation(row)">Добавить</v-btn></td>
              </tr>
            </table>

          </v-flex>
          <v-flex xs12 class="errors">
            <ul v-for="err in error">
              <li>{{err}}</li>
            </ul>
          </v-flex>



        </v-layout>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: "InputMenu",
    props:['index','inRow','inShow','attachCSS'],
    computed:{
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
      addLocation(row){
        console.log("ff2 =>",row)
        if (this.newLocation.amount<=0) {this.error.push('неверное кол-во в размещении');return}
        if (!this.newLocation.address) {this.error.push('не задан адрес размещения'); return}
        if (row.amount < row.location.reduce((acc,cur)=>acc+=cur.amount,0)+Number.parseInt(this.newLocation.amount)) {this.error.push('общее кол-во не бьется');return}

        if (row.location.findIndex(a=>a.adr==this.newLocation.address)==-1) {
          row.location.push({adr: this.newLocation.address, amount: Number.parseInt(this.newLocation.amount)})
          row.remainAmount -= Number.parseInt(this.newLocation.amount)
        }else {
          row.location.find(a => a.adr == this.newLocation.address).amount += Number.parseInt(this.newLocation.amount);
          row.remainAmount -=Number.parseInt(this.newLocation.amount)
        }
          this.error = [];
        this.dirty = !this.dirty;
        console.log('emmitting chaaaang')
        this.$emit('changed')
      },

      deleteLocation(row,adr){
        row.location.splice(row.location.findIndex(a=>a.adr == adr ),1)
        row.remainAmount += Number.parseInt(row.location.findIndex(a=>a.adr==adr).amount)
        this.dirty = !this.dirty
      }
    },
    mounted(){
      // this.row = {'name':'some name','TE':'some TE','amount':555,'location':[{'amount':0,'name':''}]};
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
