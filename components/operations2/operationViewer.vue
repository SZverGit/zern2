<template>
<div v-if="!operation.rows">
    <h1>Операция не выбрана или загружается...</h1>
</div>
    <span v-else>
  <v-app-bar   app height="125"  class="fixxxt no-print">
            <v-container>
                <v-row>
                    <v-col cols="6">
            <v-row dense justify="space-between"  align="end">
                <v-col cols="6">
                <h2> {{operation.name}} <span v-if="dirty">***</span> на {{operation.type=='отгрузка'?'отгрузку':operation.type}}</h2>
                </v-col>


    <v-col cols="6">
        <vue-ctk-date-time-picker button-now-translation="Сейчас" noClearButton no-label label="Дата и время" format="YYYY-MM-DDTHH:mm:00" locale="ru" v-model="operation.date"></vue-ctk-date-time-picker>
    </v-col>

                </v-row>

            <v-row dense align="start">
                <v-col cols="12"><v-row><v-subheader>комментарий </v-subheader><v-text-field v-model="operation.comment" @input="dirty=true"></v-text-field></v-row></v-col>

            </v-row>
                    </v-col>
                    <v-col cols="4">
                        <v-row align="stretch">
                            <v-col>
                    <v-card outlined>
                        <v-card-text>
                        всего товаров: {{operation.rows.length}}
                            <br>
                            не размещены: {{operation.info?operation.info.notLocated:null}}, неизвестны: {{operation.info?operation.info.badArt:null}}, в минус:{{operation.info?operation.info.minusAmount:null}}
                        </v-card-text>
                    </v-card>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="2"><v-row align="center"><v-col><v-btn @click="saveToDB">Сохранить</v-btn></v-col></v-row></v-col>

                </v-row>
            </v-container>
        </v-app-bar>



  <row-viewer class="print" @changed="dirty=true" :rows=operation.rows
              :type="operation.type">
  </row-viewer>
    <!--<v-row>-->
    <!--operation v2 ==><pre>{{JSON.stringify($store.state.current_operation,null,3)}}</pre>-->
    <!--stock==><pre>{{JSON.stringify($store.state.stock,null,3)}}</pre>-->
    <!--</v-row>-->
</span>
</template>

<script>
  import rowViewer from './rowViewerParted'//Подменяет rowViewer на rowViewerParted!!!*/




  export default {
    name: "operationViewer",
    components:{rowViewer},




      /*analyzeLocations(){
        this.info={location:[],articul:[]}
        if (this.operation.type=='приход'){
          console.log('counting input')
          for (var row of this.operation.rows){
            if (this.$store.getters.supplyByArticul(row.articul).name===undefined)
              this.info.articul.push(row.articul)
            console.log(row.location.reduce((acc,l2)=>{return acc+l2.amount},0))
            //if (row.location.reduce((acc,l2)=>{return acc+l2.amount},0)!=row.amount){
            console.log('REMAIN FIND')
              row.remainAmount = row.amount - row.location.reduce((acc,l2)=>{return acc+l2.amount},0)
            if (row.remainAmount!=0)
              this.info.location.push({'total':row.amount,'allocated':row.location.reduce((acc,l2)=>{return acc+l2.amount},0)})
            }


        }

      }*/
      methods:{
        analyze(){
            var locCount=0;
            var artCount=0;
            var minusAmount = 0;
            for(var row of this.operation.rows){
                if (row.remainAmount!=0) locCount+=1
                if (this.$store.getters.supplyByArticul(row.articul).name == undefined){ artCount+=1; continue;}

                if (!this.$store.state.stock[row.articul]||row.remainAmount>this.$store.state.stock[row.articul].reduce((a,b)=>{a+b.amount},0)) minusAmount+=1;
            }

            return {'badArt':artCount,'notLocated':locCount,'minusAmount':minusAmount}
            },
      saveToDB(){
        console.log('saving...',this.operation)
          if (this.operation.rows.length==0) {this.$emit('Message',{msg:'Пустая операция не может быть сохранена',type:'error'});return;}
        this.$store.state.current_operation.info = this.analyze()
        this.$store.dispatch('saveOperation').then(res=>{this.dirty=false
            this.$emit('Message', {msg:'Операция '+this.operation.name+' успешно сохранена',type:'success'})
        })
        //axios.post("http://127.0.0.1:5000/api/operation/save",this.$store.state.current_operation).then(res=>{this.dirty=false;this.$store.dispatch('getOperationList')})
      },

      moment(date){
        return moment(date);
      }
    },
    computed:{
      operation(){
          console.log('need to analyze ')
       return  this.$store.state.current_operation;
      }
    },

    data(){
      return {
        dirty:false,

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






  .fixxx{
    top:64px;
  }
  .fixed-tabs-bar{
    position: sticky;
    top:5rem;
    z-index: 3;
  }
</style>
