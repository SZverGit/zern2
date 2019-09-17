<template>
    <v-dialog v-model="show">
        <v-card>
            <v-container>
            <v-row justify="center">

                <v-col cols="6">
                    <h1>Зарегистрировать новую операцию</h1>
                </v-col>
            </v-row>
                <v-row justify="center">
                    <v-col cols="4">
                    <v-text-field label="имя операции" v-model="name"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <v-combobox label="тип операции" v-model="type" :items="operation_types.filter(t=>t!='перемещение')"></v-combobox>
                    </v-col>
                </v-row>

                    <v-row align="baseline" justify="center">
                        <v-col cols="4">
                            <vue-ctk-date-time-picker label="Дата и время" noClearButton no-label format="YYYY-MM-DDTHH:mm:00" locale="ru" v-model="date"></vue-ctk-date-time-picker>

                        </v-col>
                        <v-col cols="4">
                            <v-btn @click="resetDate">Текущая дата</v-btn>
                        </v-col>
                    </v-row>

                    <v-row justify="center">
                        <v-col cols="8">
                        <v-text-field v-model="comment" label="комментарий"></v-text-field>
                        <v-text-field label="Выбрать EXCEL файл" @click="pickFile" prepend-icon='attach_file' v-model="excelFileName"></v-text-field>
                        <input type="file" style="display:none" @change="onFilePicked" ref="excelInput" >
                        </v-col>
                    </v-row>

                <v-row justify="center">

                    <v-col cols="4">
                        Возникшие ошибки:
                        <ul v-for="error in errors">
                            <li>{{error}}</li>
                        </ul>
                    </v-col>
                    <v-col cols="4">
                        <v-btn @click="testInput">Создать</v-btn>
                        <v-btn @click="show=false">Закрыть</v-btn>
                    </v-col>
                    </v-row>



            </v-container>

        </v-card>

    </v-dialog>
</template>

<script>

    import axios from 'axios';
    import XLSX from 'xlsx';
    import Vue from 'vue';


    const operation_types=[
        'приход','отгрузка','перемещение'
    ]

    function readFile(file){
        return new Promise((resolve,reject)=>{
            var fr = new FileReader();
            fr.onload = (e)=>{
                var data = e.target.result
                var workbook = XLSX.read(data,{type: 'binary'});
                console.log(workbook)
                resolve(workbook)
            }
            fr.readAsBinaryString(file);
        })
    }



    export default {
        name: "newInput",
        props:['inShow'],
        computed:{
            show:{
                get(){
                    return this.inShow;
                },set(value){
                    this.$emit('input')
                }
            }
        },

        methods:{
            onChange(date){
                this.date = date.startDate;
            },
            pickFile(){
                console.log('pick file...',this.excelFileName)
                this.$refs.excelInput.click()
            },

            onFilePicked(e) {
                if (!e.target.files[0].name.endsWith('.xlsx')&&!e.target.files[0].name.endsWith('.xls')) {
                    this.errors.push('Принимаются только файлы формата *.xlsx и *.xls')
                    return;
                }
                this.excelFileName = e.target.files[0].name
                readFile(e.target.files[0]).then(res=>this.makeOperationFromExcelWithLocation(res))
            },
            makeMovementFromExcel(wb){
                this.type = 'перемещение'
                console.log('this is movement')
                var sheet = wb.Sheets['перемещение']

                var range = XLSX.utils.decode_range(sheet['!ref'])

                console.log('making of movement operation with locations')
                for (var row=0;row<=range.e.r;++row){
                    if (sheet[XLSX.utils.encode_cell({r:row,c:0})] == undefined) break;
                    var rowInfo = {'index':row+1,'articul':sheet[XLSX.utils.encode_cell({r:row,c:0})].v.toUpperCase().trim(),
                        'amount':sheet[XLSX.utils.encode_cell({r:row,c:2})].v,'location':[]}
                        rowInfo.location.push({'adr':sheet[XLSX.utils.encode_cell({r:row,c:1})].v,'amount':-1*(sheet[XLSX.utils.encode_cell({r:row,c:2})].v)})
                        rowInfo.location.push({'adr':sheet[XLSX.utils.encode_cell({r:row,c:3})].v,'amount':sheet[XLSX.utils.encode_cell({r:row,c:2})].v})
                    this.newOperation.rows.push(rowInfo)
                    console.log(rowInfo)
            }
            },
            makeOperationFromExcelWithLocation(wb){
                console.log("wb.sheet ",wb.Sheets)
                if (wb.Sheets['перемещение']) {this.makeMovementFromExcel(wb);this.testInput()}
                else{
                var sheet = wb.Sheets['TDSheet']
                var range = XLSX.utils.decode_range(sheet['!ref'])
                console.log('making of operation with locations')
                for (var row=24;row<=range.e.r;++row){
                    if (sheet[XLSX.utils.encode_cell({r:row,c:3})] == undefined) break;
                    var rowInfo = {'index':row-24,'articul':sheet[XLSX.utils.encode_cell({r:row,c:2})].v.toUpperCase().trim(),
                        'name':sheet[XLSX.utils.encode_cell({r:row,c:4})].v,'amount':sheet[XLSX.utils.encode_cell({r:row,c:5})].v,'location':[]}

                    var i=0
                    while(sheet[XLSX.utils.encode_cell({r:row,c:9+i})]){
                        if (this.$store.state.addressList.filter(a=>a.name==sheet[XLSX.utils.encode_cell({r:row,c:8+i})].v).length==0) {this.errors.push('Неверный адрес');return;}
                        rowInfo.location.push({'adr':sheet[XLSX.utils.encode_cell({r:row,c:8+i})].v,'amount':sheet[XLSX.utils.encode_cell({r:row,c:9+i})].v})
                        i+=2;
                    }
                    this.newOperation.rows.push(rowInfo)
                    console.log(rowInfo)
                    this.testInput()
                }
                }
            },
            makeOperationFromExcel(wb){
                console.log('WB ',wb)
                var sheet = wb.Sheets['TDSheet']
                console.log('sheet ',sheet)
                var range = XLSX.utils.decode_range(sheet['!ref'])
                console.log('range ',range)
                for(var row=24;row<=range.e.r;++row){
                    if(sheet[XLSX.utils.encode_cell({r:row,c:3})] == undefined) break;
                    console.log(sheet[XLSX.utils.encode_cell({r:row,c:4})].v)
                    this.newOperation.rows.push({'index':row-24,'articul':sheet[XLSX.utils.encode_cell({r:row,c:2})].v.toUpperCase().trim(),
                        'name':sheet[XLSX.utils.encode_cell({r:row,c:4})].v,'amount':sheet[XLSX.utils.encode_cell({r:row,c:5})].v,'location':[]})
                }
                console.log("ready to create new operation from ",this.newOperation)

                this.testInput()

                //  this.createNewOperation(operationExcel.supplies)
            },
            resetDate(){
                this.date=new Date();
            },

            testInput(){
                console.log('тест инпут')
                axios.put('http://127.0.0.1:5000/api/operation/new',{date:this.date,type:this.type,name:this.name,comment:this.comment,rows:this.rows}).
                then(res=>{
                    console.log('ERRORS!',res.data.errors)
                    if (res.data.errors.length==0){
                        //this.$store.state.current_operation={name:this.name,date:this.date,type:this.type,rows:this.newOperation.rows,comment:this.comment};
                        this.$store.commit('setOperation',{name:this.name,date:this.date,type:this.type,rows:this.newOperation.rows,comment:this.comment});
                        this.$router.push('operation')
                        this.$store.dispatch('getStockForDate',{date:this.date})}
                    else this.errors=res.data.errors
                })
            },
            resetAll(){
                this.name='',
                    this.comment='',
                    this.date = new Date(),
                    this.type=this.operation_types[0],
                    this.errors=[]
            }
        },
        mounted(){
            this.resetAll()
        },
        //beforeRouteEnter:(to,from,next)=>{console.log('fff',to,next);next()},
        data(){
            return {
                options: {
                    // defaults
                    timeFormat: {
                        locale: "russian",
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: false
                    }},
                excelFileName:undefined,
                newOperation:{rows:[],info:{}},
                name:'',
                comment:'',

                date:new Date,
                type:undefined,
                file:undefined,
                errors:[],
                operation_types:operation_types
            }
        }
    }
</script>

<style scoped>
    ul,li{
        color:red;
    }
</style>
