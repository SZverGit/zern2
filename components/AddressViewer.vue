<template>

    <v-card   :class="{movingTarget:moveTarget}">

      <!--<v-card-text>selected: {{selected}}<br>projMovements: {{projMovements}}-->
      <v-card-text>

      <v-simple-table>
        <tbody>
          <tr @click="moveTarget=true">
            <td  class="px-3 centerup" ><v-btn  @click.stop="expanded_int=!expanded_int">{{address}}</v-btn>
              V={{articules.reduce((sum,a)=>{return sum+$store.getters.supplyByArticul(a.articul).V*a.amount},0).toFixed(2)}}
            </td>
            <td nowrap>m={{articules.reduce((sum,a)=>{return sum+$store.getters.supplyByArticul(a.articul).weight/$store.getters.supplyByArticul(a.articul).boxAmount*a.amount},0).toFixed(2)}}</td>
            <td nowrap>n={{articules.length}}</td>
          </tr>

          <tr v-for="b in articules" v-show="expanded_int">
            <td @click="select(b)" class="px-3 cursor" :class="{selected: selected.find(s=>s.articul==b.articul)}">

              {{$store.state.supplyList[b.articul].name}}
            </td>
            <td>{{$store.state.supplyList[b.articul].TE}}</td>
            <td class="px-3" nowrap>{{b.amount}}
              <span  v-show="projMovements.find(pm=>pm.what==b.articul&&(pm.from==address||pm.to==address))">
              <v-icon color="primary">label_important</v-icon>
                {{b.amount+
              projMovements.filter(pm=>pm.what==b.articul&&pm.to==address).reduce((a,a1)=>a+1.0*a1.amount,0)-
              projMovements.filter(pm=>pm.what==b.articul&&pm.from==address).reduce((a,a1)=>a+1.0*a1.amount,0)
              }}
              </span>
            </td>
            <!--this.projMovements.filter(pm => pm.what == b.articul && pm.from == this.address).reduce((a, b) => a + 1.0 * b.amount, 0)-->




            <template v-if="projMovements.find(pm=>pm.what==b.articul&&(pm.from==address||pm.to==address))">
            <td class="px-3">
              <v-btn v-for="p in projMovements.filter(pm=>pm.what==b.articul&&pm.from==address)">
                <v-icon @click="deleteFromMovement(p)">remove_circle</v-icon>
                [<input type="number" min="0" :max="b.amount" v-model="p.amount"/>]
                <!--<input  type=number v-model="projMovements.find(a=>a.from==address&&a.what==b.articul).amount"/>-->

              </v-btn>



            <v-btn v-for="p in projMovements.filter(pm=>pm.what==b.articul&&pm.to==address)">
              <v-icon>add_circle</v-icon>
              {{p.from}}
              [ {{p.amount}} ]
              <!--<input  type=number v-model="projMovements.find(a=>a.from==address&&a.what==b.articul).amount"/>-->

            </v-btn>
            </td>
            </template>



          </tr>


          <tr v-if = "articules.filter(a=>pm.what==a.articul).length==0" class="projected" v-for="pm in projMovements.filter(p=>p.to==address)">
            <td class="px-3 ">{{$store.getters.supplyByArticul(pm.what).name}}</td>
            <td class="px-3 ">{{$store.getters.supplyByArticul(pm.what).TE}}</td>
            <td class="px-3">{{pm.amount}}</td>
            <td class="px-3"><v-btn>{{pm.from}}</v-btn></td>
          </tr>
        </tbody>
        </v-simple-table>
      </v-card-text>
    </v-card>


</template>

<script>


  export default {
    name: "AddressViewer",
    components: {},
    props:['address','articules','expanded'],

    data(){
      return{
        selected:[],//{articul:,amount:}
        moveTarget:false,
        expanded_int:true,
        projMovements:[]
      }
    },
    watch:{
      /*если меняется извне через property*/
      expanded(){
        console.log('expanded изменена извне')
        this.expanded_int = this.expanded
      },
      /*передает информацию об изменении во внешний компонент*/
      moveTarget(newValue,oldValue){
          console.log('watch move target')
        if (newValue) this.$emit('moveTarget',this.address)
          console.log('emitted ',newValue)
      },
      /*передает информацию об изменении во внешний компонент*/
      selected(){
        console.log("инфа об изменении выбора отправлена ")
        this.$emit('select',{address:this.address,selected:this.selected})
      }
    },

    methods:{
      reset(){
        this.moveTarget=false;
        this.selected=[];
        this.projMovements=[]
      },
      resetMovingTarget(){
        this.moveTarget=false;
      },

      deleteFromMovement(b){
        this.projMovements.splice(this.projMovements.findIndex(pm=>pm.from==b.from&&pm.to==b.to&&pm.what==b.what),1);
        this.$emit('deleteMovement',this.projMovements)
      },

      updateProjMovement(projMovement){
        console.log('получаю новые данные по перемещениям на адрес ',this.address)
        this.projMovements = projMovement;
      },

      clearSelect(){
        this.selected=[]
        this.resetMovingTarget()
      },




      select(b){

        if (this.selected.find(s=>s.articul==b.articul))
          this.selected.splice(this.selected.findIndex(a=>a.articul==b.articul),1)
        else {
          var maxCount=b.amount - this.projMovements.filter(pm => pm.what == b.articul && pm.from == this.address).reduce((a, b) => a + 1.0 * b.amount, 0)+
            this.projMovements.filter(pm => pm.what == b.articul && pm.to == this.address).reduce((a, b) => a + 1.0 * b.amount, 0)
          if (!maxCount==0)
          this.selected.push({
            articul: b.articul,
            amount: maxCount
          })
        }
        // if (this.projMovements.filter(pm=>pm.what==b.articul).length>0) return;
       // if (this.projMovements.find(pm=>pm.what==b.articul&&pm.amount==b.amount)) return;
       // if (this.selected.includes(b.articul))
       //   this.selected.splice(this.selected.findIndex(a => a == b.articul), 1)
       // else
       //   this.selected.push(b.articul)
        //console.log('emitting select',{address:this.address,selected: this.selected})
        //this.$emit('select',{address:this.address,selected: this.selected})
      }
    }
  }
</script>

<style scoped>
  .projected{
    background-color: lightblue;
  }
  .selected{
    background-color: #90A4AE;
  }
  .minWidth{
    min-width:100px;
  }
  .centerup{
    vertical-align: top;
  }
  .movingTarget{
    background-color: #ffebee;
  }
  .cursor{
    cursor: pointer;
    /*background-color: ;*/
  }


</style>
