<template>
<span>
  <v-toolbar class="fixed-tabs-bar no-print">
  <v-layout>
    <v-flex><h2>Заявка {{operation.name}} <span v-if="dirty">***</span> на {{operation.type}}</h2>
      <h3>
          <vue-ctk-date-time-picker label="Дата и время" format="YYYY-MM-DDTHH:mm:00" locale="ru" v-model="operation.date"></vue-ctk-date-time-picker>
      </h3>
    </v-flex>
    <v-text-field v-model="operation.comment" @input="dirty=true"></v-text-field>
    <v-btn @click="saveToDB">Сохранить</v-btn>
  </v-layout>
    Всего позиций:{{operation.rows.length}}
    <br>проблемных артикулов: {{info.articul.length}}, не размещены: {{info.location.length}}
  </v-toolbar>

  <row-viewer class="print" @changed="dirty=true" :rows=operation.rows
              :type="operation.type">
  </row-viewer>
    ==><pre>{{JSON.stringify($store.state.current_operation,null,3)}}</pre>
</span>
</template>

<script>
  import rowViewer from './rowViewer'

  export default {
    name: "operationViewer",
    components:{rowViewer},


    methods:{

      analyze(){
        var locCount=0;
        var artCount=0;
        for(var row of this.operation.rows){
            if (row.remainAmount!=0) locCount+=1
            if (this.$store.getters.supplyByArticul(row.articul).name == undefined) artCount+=1;
        }

        return {'badArt':artCount,'notLocated':locCount}
       /* if (this.operation.type=='приход'){
          //console.log('counting input')
          for (var row of this.operation.rows){
            if (this.$store.getters.supplyByArticul(row.articul).name===undefined)
              this.info.articul.push(row.articul)
            //console.log(row.location.reduce((acc,l2)=>{return acc+l2.amount},0))
            //if (row.location.reduce((acc,l2)=>{return acc+l2.amount},0)!=row.amount){
            //console.log('REMAIN FIND')
              row.remainAmount = row.amount - row.location.reduce((acc,l2)=>{return acc+l2.amount},0)
            if (row.remainAmount!=0)
              this.info.location.push({'total':row.amount,'allocated':row.location.reduce((acc,l2)=>{return acc+l2.amount},0)})
            }


        }*/

      },
      saveToDB(){
        console.log('saving...',this.operation)
        this.$store.state.current_operation.info = this.analyze()
        this.$store.dispatch('saveOperation').then(res=>this.dirty=false)
        //axios.post("http://127.0.0.1:5000/api/operation/save",this.$store.state.current_operation).then(res=>{this.dirty=false;this.$store.dispatch('getOperationList')})
      },

      moment(date){
        return moment(date);
      }
    },

    computed:{
      operation(){
       return  this.$store.state.current_operation;
      }
    },

    data(){
      return {
        dirty:false
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

  .fixed-tabs-bar{
    position: sticky;
    top:4rem;
    z-index: 3;
  }
</style>
