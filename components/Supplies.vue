<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">

      <v-container fluid>
        <v-row>
          <v-flex xs2>
            <v-flex><h3>Товаров в базе: {{supplies.length}}</h3></v-flex>
            <v-divider></v-divider>

            <v-switch v-model="allowDeleting" label="Разрешить удаление/импорт"></v-switch>
          </v-flex>
          <v-flex xs2 px-3>Обозначения V0.2
            <table>
              <tr class="altered">
                <td class="td">Изменен</td>
              </tr>
              <tr class="new">
                <td class="td">Новый</td>
              </tr>
            </table>

          </v-flex>
          <v-flex xs2>
            <v-dialog v-model="showNewDialog" max-width="400px">
              <template v-slot:activator="{on}">
                <v-btn v-on="on" color="primary">Добавить</v-btn>
              </template>
              <v-layout>
                <v-flex>
              <v-card xs6>
                <v-card-title
                  class="headline grey lighten-2"
                  primary-title
                >
                  Новый товар
                </v-card-title>

                <v-card-text>
                  <v-text-field label="Артикул" required v-model="newSupply.articul"></v-text-field>
                  <v-text-field label="Наименование" v-model="newSupply.name"></v-text-field>
                  <v-text-field label="ТЕ" v-model="newSupply.TE"></v-text-field>
                  <v-text-field label="Объем единицы" type="number" v-model="newSupply.V"></v-text-field>
                  <v-text-field label="Комментарий" v-model="newSupply.comment"></v-text-field>
                  <v-text-field label="Количество в коробке" type="number" v-model="newSupply.boxAmount"></v-text-field>
                  <v-text-field label="Вес единицы" type="number" v-model="newSupply.Weight"></v-text-field>
                  <v-alert v-if="error"
                           :value="true"
                           type="error"
                  >
                    {{error}}
                  </v-alert>
                </v-card-text>

                <v-card-actions>
                  <v-btn @click="addNewSupply">
                    Добавить
                  </v-btn>
                  <!--v-btn @click="showNewDialog=false;error=''">Закрыть без изменений</v-btn-->
                </v-card-actions>
              </v-card>
                </v-flex>
              </v-layout>
            </v-dialog>
          </v-flex>
          <v-flex>
            <v-btn @click="sendToDB">Обновить данные в базе/Синхронизация</v-btn>
            <v-btn @click="downloadExcel">Download EXCEL</v-btn>
            <v-text-field v-if="allowDeleting" label="Выбрать EXCEL файл с номенклатурой" @click="pickFile" prepend-icon='attach_file' v-model="excelFileName"></v-text-field>
            <input type="file" style="display:none" ref="excelInput" @change="onFilePicked">
          </v-flex>
        </v-row>
        <v-row>
          <v-flex xs4></v-flex>
          <v-flex><v-text-field label="Фильтр по наименованию" v-model="filterString"></v-text-field></v-flex>
        </v-row>
        <v-row>
            <v-tabs
              dark
              slider-color="blue"
            >
              <v-tab ripple>Товары</v-tab>
              <v-tab ripple>Топология склада</v-tab>
              <v-tab-item >

                <v-simple-table dense fixed-header  height="600px">
<thead>
                  <tr>
                    <th>#</th>
                    <th>Артикул</th>
                    <th>Наименование</th>
                    <th>TE</th>
                    <th>Объем</th>
                    <th>Вес</th>
                    <th>В коробке</th>
                    <th>Комментарий</th>
                    <th></th>


                  </tr>
</thead>
                  <tbody>
                  <tr v-for="(sup,index) in supplies.filter(s=>s.name.toLowerCase().includes(filterString.toLowerCase()))" v-bind:class="{altered:sup.status=='altered',new:sup.status=='new'}" >
                    <td>{{index+1}}.</td>
                    <td>{{sup.articul}}</td>
                    <td><input type="text" @input="sup.status='altered'" v-model="sup.name"/></td>
                    <td><input type="text" @input="sup.status='altered'" v-model="sup.TE"/></td>
                    <td><input type="number" @input="sup.status='altered'" v-model="sup.V"/></td>
                    <td><input type="number" @input="sup.status='altered'" v-model="sup.weight"/></td>
                    <td><input type="number" @input="sup.status='altered'" min="0" v-model="sup.boxAmount"/></td>
                    <td><input type="text" @input="sup.status='altered'" v-model="sup.comment"/></td>


                    <td><span v-if="allowDeleting"><v-icon @click="deleteSupply(sup.articul)">delete_forever</v-icon></span>{{sup.status}}</td>
                  </tr>
                  </tbody>
                </v-simple-table>

              </v-tab-item>
              <v-tab-item>
                <v-simple-table fixed-header height="500px">
                  <tr>
                    <th>#</th>
                    <th>Адрес</th>
                  </tr>

                  <tr v-for="adr,ind in topology">
                    <td>{{ind+1}}.</td>
                    <td>{{adr.name}}</td>
                    <td>{{adr.status}}</td>
                  </tr>

                </v-simple-table>
              </v-tab-item>
            </v-tabs>

        </v-row>
  <!--<pre>{{supplies}}</pre>-->
      </v-container>

</template>

<script>
  import axios from 'axios';
  import XLSX from 'xlsx';
  import saveAs from 'file-saver';
  import moment from 'moment';

  function int(a){
    return Number(a)
  }

  function s2ab(s) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
  }

  /*json_data={supplies:{},topology:{}}*/
  function toExcel(json_data){
    var wb = XLSX.utils.book_new();
    wb.SheetNames.push("номенклатура");
    var ws = XLSX.utils.json_to_sheet(json_data.supplies);
    wb.Sheets["номенклатура"] = ws
    wb.SheetNames.push("топология");
    console.log('to excel',json_data)
    ws = XLSX.utils.json_to_sheet(json_data.topology);
    wb.Sheets["топология"] = ws;
    return new Blob([s2ab(XLSX.write(wb,{bookType:'xlsx',type:'binary'}))],{type:''})
  }



  function readFile(file,sheet_name){
    return new Promise((resolve,reject)=>{
      var fr = new FileReader();
      fr.onload = (e)=>{
        var data = e.target.result
        var workbook = XLSX.read(data,{type: 'binary'});
        resolve(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name],{raw:true}))
      }
      fr.readAsBinaryString(file);
    })
  }

  export default {
    name: "Supplies",
    methods:{
      pickFile(){
        this.$refs.excelInput.click()
      },


//read////////////
      onFilePicked(e){
        if (!e.target.files[0].name.endsWith('.xlsx'))
        {
          this.$emit('Message',{type:'error',msg:'Принимаются только файлы формата *.xlsx'})
          return;
        }
        this.excelFileName = e.target.files[0].name
        readFile(e.target.files[0],'номенклатура').then(res=>this.updateSuppliesFromExcel(res))
        readFile(e.target.files[0],'топология').then(res=>this.updateTopologyFromExcel(res))
        //this.excelFileName = ''
      },

      downloadExcel(){
        var trtop = []
        for (var a of this.topology)
          trtop.push(a)
        console.log('down excel topology ',this.topology)
        saveAs(toExcel(
          {supplies:this.supplies.map(s=>{delete s['status'];return s;}),
            topology:trtop.map(s=>{delete s['status'];return s;})}
        ),'номенклатура'+moment().format('YYMMDD')+'.xlsx')
      },

      sendToDB(){
        console.log('need to update: ',this.supplies.filter(s=>s.status))
        axios.post('http://127.0.0.1:5000/api/supplies/add',this.supplies.filter(s=>s.status)).then(
          response=>{
            console.log('updated ',response.data);
            if (this.supplies.filter(s=>s.status).length!=Number.parseInt(response.data)) {this.$emit('Message',{type:'error',msg:'Обновление не прошло!'});}
            else {
              console.log('this.suppl ',this.supplies)
              //for (var s of this.supplies.filter(s=>s.status)) s.status = ''
              //this.supplies.map(s=>s.status='')
              console.log(this.supplies)
              this.$emit('Message', {msg:'Обновление прошло успешно, обновлено ' + parseInt(response.data) + ' записей',type:'success'})
              this.$store.dispatch('getSupplies')
              //this.$store.dispatch('getAddresses')
            }
          }).catch(
            error=>this.$emit('Message',{msg:'Сервер недоступен '+error,type:'error'})
        )

        axios.post('http://127.0.0.1:5000/api/topology/add',this.topology.filter(t=>t.status)).then(
          response=>{

          }
        )
      },
      addNewSupply(){
        if (this.newSupply.articul&&!this.supplies.find(s=>s.articul==this.newSupply.articul)&&this.newSupply.name&&this.newSupply.TE){
          this.supplies.unshift(this.newSupply)
          this.newSupply = {'status':'new'}
          this.showNewDialog=false;
          this.error = ''
        } else {
          this.error = 'Товар с этим артикулом уже существует или введены не все данные'
        }
      },
      deleteSupply(articul){
        console.log('dellll sup ',articul)
        this.$store.dispatch("deleteSupply",articul).then(
          res=>{this.$emit('Message',{msg:res.msg,type:res.type})}
        )
      },
      updateTopologyFromExcel(json){
        console.log('updateTopFromExcel',json)
        for (var nTop of json){
          console.log('ntop',nTop)
          if(!this.topology.find(t=>t.name==nTop.name)){
            nTop.status = 'new';
            this.topology.unshift(nTop)
          }
        }
      },
      updateSuppliesFromExcel(new_json){
        console.log('updateSuppliesFromExcel',new_json)
        for (var new_sup of new_json){
          //*создать*//
          if(!this.supplies.find(sup=>new_sup.articul.toUpperCase()==sup.articul.toUpperCase())){
            console.log('need to add',new_sup)
          new_sup.status = 'new'
          this.newSupply = new_sup;
            this.newSupply.articul = this.newSupply.articul.toUpperCase()
          this.addNewSupply()}
          else{
            //*изменить*//
            var old=this.supplies.find(sup=>new_sup.articul==sup.articul);
            if (old.name!=new_sup.name||old.TE!=new_sup.TE||old.V!=new_sup.V||
              old.boxAmount!=new_sup.boxAmount||old.comment!=new_sup.comment||
              old.weight!=new_sup.weight) {
              console.log('need to update',old,new_sup,old.weight,new_sup.weight)
              old.name = new_sup.name||null
              old.TE = new_sup.TE||null
              old.V = new_sup.V||null
              old.weight=new_sup.weight||null
              old.boxAmount = new_sup.boxAmount||null
              old.comment = new_sup.comment||null
              old.status='altered'
            }
          }
        }

      },

    },
    computed:{
      supplies(){
        console.log('compute supplies!-!')
        return Object.values(this.$store.state.supplyList)
      },
      topology(){
        console.log('топчик',this.$store.state.topology)
        return this.$store.state.addressList
      }
    },
    data(){
      return{
        allowDeleting:false,
        filterString:'',
        showNewDialog:false,
        excelFileName:'',
        error:'',
        newSupply:{'status':'new'}
      }
    }
  }
</script>

<style scoped>
  table {
    border-collapse: collapse;
  }
  .td {
    border: 2px solid firebrick; /*устанавливаем для таблицы внешнюю границу серого цвета толщиной 1px*/
    text-align: center;
    padding:0px;
    padding-left: 2px;
    padding-right: 2px;
  }
  td span {
    cursor: pointer;
  }
  /*tr td:last-child{
    width:10%;
    white-space:nowrap;
  }*/

  tr.new{
    background-color: #00b0ff;
  }
  input{
    outline:none;
    /*min-width:100%;*/
  }
  tr.altered{
    background-color: thistle;
  }
</style>
