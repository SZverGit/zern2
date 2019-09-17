<template>
  <v-container fluid>
    <output-menu v-if="type=='отгрузка'" @changed="rowChanged(rows[selectedRowId]);$emit('changed')" :index="selectedRowId+1" :inRow="rows[selectedRowId]" :inShow="editMenu" v-model="editMenu"></output-menu>
    <input-menu v-if="type=='приход'" @changed="$emit('changed')" :index="selectedRowId+1" :inRow="rows[selectedRowId]" :inShow="editMenu" v-model="editMenu"></input-menu>

    <v-toolbar color="primary" class="fixed-tabs-bar no-print">
      <v-menu
        v-model="menu.on"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
        transition="scale-transition"
      >
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" small color="success">
            <v-icon>library_add</v-icon>
            добавить
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <v-combobox item-text="name" @change="menu.error=''" v-model="newSupply.supply" :items="Object.values($store.state.supplyList)" label="наименование">
              <template slot="item" slot-scope="data">
                [ {{data.item.articul}} ]   {{data.item.name}}
              </template>
            </v-combobox>
            <v-text-field v-model="newSupply.amount" type="number" min="0"></v-text-field>
            <div v-if="menu.error.length>0" class="error">{{menu.error}}</div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click="menu.on = false">Закрыть</v-btn>
            <v-btn color="primary" flat @click="addSupply">Добавить</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <v-divider inset vertical></v-divider>
      <v-btn @click="deleteRow" small color="error">
        <v-icon>delete_forever</v-icon>
        удалить
      </v-btn>
      <v-divider inset vertical></v-divider>
      <v-btn @click="getUp" small color="primary">
        <v-icon>expand_less</v-icon>

      </v-btn>
      <v-btn @click="getDown" small color="primary">
        <v-icon>expand_more</v-icon>

      </v-btn>

      <v-spacer></v-spacer>
      <v-divider inset vertical></v-divider>
      <v-checkbox label="Лист/таблица" v-model="showAsList"></v-checkbox>
      <!--v-btn @click="saveToDatabase" small color="success">Сохранить</v-btn-->
    </v-toolbar>
    <v-container fluid>
      <v-layout column>

        <v-card @click="selectRow($event,index)" @dblclick="showEditMenu"
                :class="{selected:selectedRowId==index,errors:$store.getters.supplyByArticul(row.articul).name===undefined}"
                v-for="row,index in rows" :id="'n'+index">
          <v-card-text>
            <v-layout row wrap>

              <v-flex xs1>
                {{index+1}}.
              </v-flex>

              <v-flex xs2>
                <!--{{$store.state.supplyList[row.articul].TE}}-->
                {{$store.getters.supplyByArticul(row.articul).TE}}
                <br>
                <br>
                <b>{{$store.getters.supplyByArticul(row.articul).comment}}</b>
              </v-flex>

              <v-flex xs4>

                <!--{{$store.state.supplyList[row.articul].name}}-->
                {{$store.getters.supplyByArticul(row.articul).name}}
              </v-flex>

              <v-flex xs1>
                <h2 :class="{errors:(row.remainAmount!=0)}" >{{row.amount}}</h2>
              </v-flex>
              <v-flex xs2>
                <tr v-for="adr in $store.state.stock[row.articul]">
                  <td class="px-3 dimmed">{{adr.adr}}</td>
                  <td class="px-3 dimmed">{{adr.amount}}</td>
                </tr>
              </v-flex>
              <v-spacer></v-spacer>
              <v-flex xs2>
                <table>
                  <tr v-for="loc in row.location">
                    <td class="px-2">{{loc.adr}}</td>
                    <td class="px-2">{{loc.amount}}</td>
                  </tr>

                </table>

              </v-flex>
              <v-spacer></v-spacer>




            </v-layout>
          </v-card-text>
        </v-card>
      </v-layout>
      <!--<pre>{{JSON.stringify(rows,null,2)}}</pre>-->
    </v-container>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import inputMenu from './inputMenu'
  import outputMenu from './outputMenu'

  export default {
    components:{inputMenu,outputMenu},
    props:['rows','type'],
    name: "rowViewer",
    methods:{

        rowChanged(row){

        },

      selectRow(e,index){
        //console.log('sel',e,index)
        //if (!e.ctrlKey) return
        this.selectedRowId = index;
      },

      deleteRow(){
        console.log('delete row',this.selectedRowId,this.rows[this.selectedRowId])
        this.rows.splice(this.selectedRowId,1)
        if (this.selectedRowId==this.rows.length) this.selectedRowId=this.rows.length-1
        this.dirty = !this.dirty
      },

      showEditMenu(){
        console.log('showEditMenu')
        this.error=[]
        this.editMenu = true;
        this.editMenuAttach = '#a'+this.selectedRowId;
      },

      getDown(){
        //var startIndex = this.rows.findIndex(a=>a.id == this.selectedRowId)
        var startIndex = this.selectedRowId;
        if (startIndex==this.rows.length-1) return;
        let swapped=[this.rows[startIndex+1],this.rows[startIndex]]
        this.rows.splice(startIndex,2,swapped[0],swapped[1])
        this.selectedRowId +=1;
        this.dirty=!this.dirty;
      },
      getUp(){
        // var startIndex = this.rows.findIndex(a=>a.id == this.selectedRowId)

        var startIndex = this.selectedRowId;
        if (startIndex==0) return;
        let swapped=[this.rows[startIndex],this.rows[startIndex-1]]
        this.rows.splice(startIndex-1,2,swapped[0],swapped[1])
        this.selectedRowId -=1;
        this.$emit('changed');
      },



      addLocation(row){
        console.log("ff =>",row)
        if (this.newLocation.amount<=0) {this.error.push('неверное кол-во в размещении');return}
        if (!this.newLocation.address) {this.error.push('не задан адрес размещения'); return}
        console.log('before reduce ./')
        console.log('a11a => ',row.location.reduce((pr,cur)=>pr+=cur.amount,0)+this.newLocation.amount,row.amount)
        if (row.amount < row.location.reduce((acc,cur)=>acc+=cur.amount,0)+Number.parseInt(this.newLocation.amount)) {this.error.push('общее кол-во не бьется');return}

        if (row.location.findIndex(a=>a.adr==this.newLocation.address)==-1)
          row.location.push({adr:this.newLocation.address,amount:Number.parseInt(this.newLocation.amount)})
        else
          row.location.find(a=>a.adr==this.newLocation.address).amount += Number.parseInt(this.newLocation.amount);
        console.log('em ch')
        this.error=[]
        this.$emit('changed')
      },
      deleteLocation(row,adr){
        row.location.splice(row.location.findIndex(a=>a.adr == adr ),1)
        this.dirty = !this.dirty
      },
      addSupply(){
        if (!this.newSupply.supply) {this.menu.error="Выбери товар!";return;}
        this.menu.error = ''
        var index = this.rows.findIndex(a=>a.name==this.newSupply.supply.name);
        console.log('ind',index,this.newSupply.supply.name)
        console.log('REMAIN FIND')
        if (index==-1) {

          this.rows.push({
            name: this.newSupply.supply.name,
            amount: this.newSupply.amount,
            articul:this.newSupply.supply.articul,
            TE:this.newSupply.supply.TE,
            location:[],
            remainAmount:this.newSupply.amount
          });
          this.newSupply = {supply:null,amount:0};
          console.log('pushing')
        }
        else
          this.rows[index].amount = parseInt(this.rows[index].amount) + parseInt(this.newSupply.amount)
        console.log('adding')
        this.dirty = !this.dirty
      }},
    watch:{
      dirty(){
        console.log('изменено')
        this.$emit('changed')
      }
    },
    computed:{
      stock(){
        return this.$store.state.stock;
      }
    },
    data(){
      return{
        newLocation:{address:'',amount:0},
        idCount:1000,
        editMenu:false,
        editMenuAttach:undefined,
        dirty:false,
        showAsList:true,
        newSupply:{supply:null,amount:0},
        menu:{on:false,error:''},
        selectedRowId:null,
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
  .selected{
    background-color: #90A4AE;
  }
  table{
    width: 100%;
  }
  td input{
    width:100%;
  }
  @media print
  {
    .no-print, .no-print *
    {
      display: none !important;
    }
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
  v-card#3{
    color:blue;
  }
  .fixed-tabs-bar{
    position: sticky;
    top:8rem;
    z-index: 2;
  }
  tr td{
    width:1px;
    white-space: nowrap;
  }
</style>
