<template>
  <v-container fluid>

    <v-card class="fixed-tabs-bar">
      <v-card-text>
        занято паллетомест:{{Object.keys(getStockByAddress).length}}<v-btn @click="scuffold=!scuffold">Показать/скрыть</v-btn>
        <v-btn @click="clearSelect">Очистить выбор</v-btn>
        <v-btn @click="addMovement">Перемещение</v-btn>
        <v-btn @click="makeReplacement">Провести</v-btn>
        <!--{{warn}}-->
        <!--projMovements:{{projMovements}}-->
        <!--selected:{{selected}}-->

        <!--<br>-->
        <!--маска выбора :-->
<!--//bpv123 1g0502->1g0802-->
        <!--<br>moving to: {{moveToAddress}}-->
      </v-card-text>
    </v-card>

    <v-menu
      v-model="show"
      :position-x="x"
      :position-y="y"
      offset-y
    >
      <v-card>
        <v-card-text>
          <v-btn @click="addMovement">Переместить</v-btn>


        </v-card-text>
      </v-card>

    </v-menu>


    <!--<v-layout row wrap v-for="n in 50" :key="n">-->
    <!--<v-layout row wrap>-->
    <!--<v-flex xs4 v-for="arts,address in getStockByAddress" :key="address">-->
    <!--<address-view :ref="address"-->
    <!--:articules="arts"-->
    <!--:address="address"-->
    <!--:expanded="scuffold"-->
    <!--@select="addSelected"-->
    <!--@moveTarget="setMoveTo">-->
    <!--</address-view>-->
    <!--</v-flex>-->
    <!--</v-layout>-->

    <v-layout row wrap>
      <!--<address-view v-for="arts,address in Object.keys(getStockByAddress)" :key="address" :ref="address"-->
                    <!--:articules="arts"-->
                    <!--:address="address"-->
                    <!--:expanded="scuffold"-->
                    <!--@select="addSelected"-->
                    <!--@moveTarget="changeMoveTarget"-->
                    <!--@deleteMovement="deleteMovement">-->

      <!--</address-view>-->
      <!--<address-view v-for="address in Object.keys(getStockByAddress).sort()" :key="address" :ref="address"-->
                    <!--:articules="getStockByAddress[address]"-->
                    <!--:address="address"-->
                    <!--:expanded="scuffold"-->
                    <!--@select="addSelected"-->
                    <!--@moveTarget="changeMoveTarget"-->
                    <!--@deleteMovement="deleteMovement">-->
      <address-view v-for="address in $store.state.addressList" :key="address.name" :ref="address.name"
                    :articules="getStockByAddress[address.name]||[]"
                    :address="address.name"
                    :expanded="scuffold"
                    @select="addSelected"
                    @moveTarget="changeMoveTarget"
                    @deleteMovement="deleteMovement">

      </address-view>
      <!--<span v-for="adr in $store.state.addressList">{{adr}}</span>-->
    </v-layout>

    <!--<pre>{{getStockByAddress }}</pre>-->
    <!--</v-layout>-->
  </v-container>
</template>

<script>
  import axios from 'axios'
  import addressView from './AddressViewer'



  /*Для отображения, раскидывает по адресам, добавляет id. Данные из selected и projMovements добавляются на уровне разметки
  * (рассмотреть возможность оптимизации)*/
  function getStockByAddress1(inputStock) {
    var stock = {}
    ////console.log('ret stock',projMovements)

    for (var art in inputStock) {
      inputStock[art].forEach(
        (i) => {////console.log(i);
          if (!stock[i.adr])
            stock[i.adr] = [];

          //console.log(i.adr,art,projMovements.find(a=>a.from==i.adr&&a.what==art))
          stock[i.adr].push({articul: art, id: i.adr+art,amount: i.amount})
        }
      )
    }
    return stock;
  }


  export default {
    name: "SupplyLocationList",
    components:{addressView},
    computed:{
      getStockByAddress(){
        return getStockByAddress1(this.$store.state.stock)
      }
    },
    methods: {
      deleteMovement(b){
        console.log('delete ',b)
        this.projMovements=b

      },
      makeReplacement(){
        console.log('текущая дата ',new Date())
        this.$store.dispatch('makeMovementV2',this.projMovements).then(
          ()=>{
            var adresses = new Set();
            for(var adr of this.projMovements) {
              adresses.add(adr.to)
              adresses.add(adr.from)
            }
            for (var adr of adresses) {
             console.log('$refs',adr,this.$refs[adr])
              this.$refs[adr][0].reset()
            }
            console.log('adress Set: ',adresses)
            this.$store.dispatch('getStockForDate',{date:new Date(),'byAddress':false})
            this.$store.dispatch('getOperationList')
            this.projMovements=[]
          }
        )
      },
      clearSelect(){

        var viewersToReset=[];
        this.selected.forEach(s=>{if (!viewersToReset.includes(s.address)) viewersToReset.push(s.address)})
        console.log('to Reset: ',viewersToReset)

        for (var adr of viewersToReset){
          this.$refs[adr][0].clearSelect()
          //console.log(this.$refs[mov.from][0].flash(mov))
        }
        this.selected=[]
        this.$refs[this.moveToAddress][0].resetMovingTarget();
        this.moveToAddress=null

      },

      addSelected(b){
        console.log('add selected',b)
        this.selected = this.selected.filter(s=>s.address!=b.address);
        for (var art of b.selected){
          this.selected.push({address:b.address,articul:art.articul,amount:art.amount})
        }
        console.log('selected now is ',this.selected)
      },

      changeMoveTarget(adr){
        if (this.moveToAddress) this.$refs[this.moveToAddress][0].resetMovingTarget()
        this.warn = 'moving to '+adr
        this.moveToAddress = adr;
      },

      async showMenu(event) {
        event.preventDefault()

        this.show = false;
        this.x = event.clientX;
        this.y = event.clientY;

        await this.$nextTick
        //console.log('next tick')
        this.show = true;
      },


      addMovement() {
        if (!this.moveToAddress) {this.warn = 'ERROR! Не указан адрес перемещения!';return}
        console.log('Перемещаем ',this.selected, ' на адрес ',this.moveToAddress)

        for (var s of this.selected){
          console.log(s)
          this.projMovements.push({what:s.articul,to:this.moveToAddress,from:s.address,amount:s.amount})
        }

        this.clearSelect()

      },



    },

    data(){
      return {
        show:false,
        mask:'adr*',
        x:100,
        y:100,
        warn:"none",
        moveToAddress:null,
        selected:[],
        projMovements:[],
        scuffold:true,
        //getStockByAddress:{}//getStockByAddress1(this.$store.state.stock,this.selected,this.projMovements)
      }
    },
    watch:{
      projMovements(){
        console.log('projMov изменился')

        var sendTo=[]

        this.projMovements.forEach(
          mov=>{
            if (sendTo.indexOf(mov.from)===-1) sendTo.push(mov.from)
            if (sendTo.indexOf(mov.to)===-1) sendTo.push(mov.to)
          }
        );

        for (var adr of sendTo){
          console.log('sendTo =>',adr)
          this.$refs[adr][0].updateProjMovement(this.projMovements)
        }

        //   this.projMovements.forEach(mov=>{
        //     console.log('mov',mov)
        //     console.log(this.$refs[mov.from][0].flash(mov))
        //     console.log(this.$refs[mov.to][0].flash(mov))
        //   })
      }
    },

    mounted(){
      this.$store.dispatch('getStockForDate',{date:new Date(),'byAddress':false}).then(
        ()=>{
          this.getStockByAddress=getStockByAddress1(this.$store.state.stock,this.selected,this.projMovements)
        });
    },


  }
</script>

<style scoped>
  table,th,td{
    border: 2px solid #546E7A;
    border-collapse: collapse;
    width: 50%;
    /*background-color: ;*/
  }
  .fixed-tabs-bar{
    position: sticky;
    top:4rem;
    z-index: 3;
  }

  .no-show{
    display: none;
  }
  .selected{
    background-color: #90A4AE;
  }
  td input{
    width:60px;
    text-align: center;
  }
  .wind{
    width:300px;
  }
  .projected{
    background-color: aliceblue;
  }
</style>
