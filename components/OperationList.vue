<template>
  <v-container>
    <v-row>
      <v-col cols="2">
    <new-dialog :inShow="newShow" v-model="newShow"></new-dialog>
    <v-btn @click="newShow=true">Создать</v-btn>
      </v-col>
        <v-col cols="4">

            показывать по <input min="0" max="100" type="number" v-model.number="limit"/>
            <v-icon large @click="getPartOfOpList(-1)">arrow_left</v-icon>
            {{offset}}-{{offset+limit}}
            <v-icon large @click="getPartOfOpList(1)">arrow_right</v-icon>

        </v-col>
        <v-col cols="2">
            <v-btn @click="getPartOfOpList(0)">Показать</v-btn>
        </v-col>
    </v-row>



      <v-row>
<v-col cols="12">
      <v-simple-table>
        <thead>
      <tr>
        <th>#</th>

        <th></th>
        <th>имя</th>
        <th>дата</th>
        <th>тип</th>

        <th>комментарий</th>
        <th class="px-3">товары</th>
        <th>проблемы</th>

      </tr>
        </thead>
        <tbody>
    <tr  v-for="(oper,index) in operationList">
      <td class="px-3" width="20px;">{{index+1+offset}}.</td>
        <td>
            <v-icon small color="green" v-if="oper[2]=='отгрузка'">call_made</v-icon>
            <v-icon small color="red" v-if="oper[2]=='приход'">call_received</v-icon>
            <v-icon color="blue" v-if="oper[2]=='перемещение'">swap_horiz</v-icon>
        </td>


      <td @click="goToOperation(oper[0],oper[2])" class="px-3 hand"><h2>{{oper[0]}}</h2></td>
      <td class="px-3">{{new Date(oper[1])|moment}}</td>


      <td class="px-3">{{oper[2]}}</td>
      <td class="px-3">{{oper[3]}}</td>
      <td class="px-3">{{oper[4]}}</td>

      <td class="px-3"> <span>{{JSON.parse(oper[5]).notLocated?'не полностью размещен':''}}{{JSON.parse(oper[5]).badArt?'; проблемный артикул':''}}{{JSON.parse(oper[5]).minusAmount?'; в минус':''}}</span></td>
      <td><v-btn @click="deleteOperation(oper[0],oper[2])">Удалить</v-btn></td>

    </tr>
        </tbody>
    </v-simple-table>
</v-col>
      </v-row>

    <!--{{operationList}}-->
    <!--<pre>{{$store.state.stock}}</pre>-->

  </v-container>
</template>

<script>
import newDialog from './newOperationDialog'
import moment from 'moment'

    export default {
        name: "OperationList",
       components:{newDialog},
        filters:{
          moment(data){
              return moment(data).format('DD/MM/YYYY HH:mm:ss')
          }
        },
      data(){
        return{
          newShow:false,
            offset:0,
            limit:100,
            notLimited:true
        }
      },
        computed:{
            operationList(){return this.$store.state.operationList}
        },
      methods:{
            getPartOfOpList(direction){
                if(this.operationList.length<this.limit&&direction==1) return
                if (this.offset==0 && direction==-1) return
                console.log('this.off ',this.offset<this.limit)
                if (direction==-1) this.offset = (this.offset<this.limit)?0:this.offset-this.limit;
                if (direction==1) this.offset+=this.limit;
                this.$store.dispatch('getOperationList',{offset:this.offset,limit:this.limit})


            },
          deleteOperation(name,type){
              console.log('deleting operation ',name,type)
            this.$store.dispatch('deleteOperation',{name,type}).then(

            )
          },

          goToOperation(name,type){
            console.log('go to ',name,type)
            this.$store.dispatch('getOperation',{name,type}).then(
              res=>{this.$router.push('operation');console.log('goToOp: ',res)} //

            )
      }
      }


    }
</script>

<style scoped>
  .hand{
    cursor: pointer;
  }


</style>
