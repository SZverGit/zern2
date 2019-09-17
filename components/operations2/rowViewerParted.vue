<template>
    <v-container fluid>
        <output-menu v-if="type=='отгрузка'" @changed="rowChanged" :index="selectedRowId+1" :inRow="rows[selectedRowId]" :inShow="editMenu" v-model="editMenu"></output-menu>
        <input-menu v-if="type=='приход'" @changed="rowChanged" :index="selectedRowId+1" :inRow="rows[selectedRowId]" :inShow="editMenu" v-model="editMenu"></input-menu>

        <v-toolbar dark class="fixed-tabs-bar">
            <v-menu
                    v-model="menu.on"
                    :close-on-content-click="false"
                    :nudge-width="200"
                    offset-x
                    transition="scale-transition"


            >
                <template v-slot:activator="{ on }">
                    <v-btn id="button" v-on.prevent="on" small color="success">
                        <v-icon>library_add</v-icon>
                        добавить
                    </v-btn>
                </template>
                <v-card>
                    <v-card-text>
                        <v-autocomplete item-text="name" return-object @change="menu.error=''" v-model="newSupply.supply" no-data-text="НИИ Ча Во" :items="Object.values($store.state.supplyList)" label="наименование">
                            <template slot="item" slot-scope="data" >
                                [ {{data.item.articul}} ]  {{data.item.name}}
                            </template>
                        </v-autocomplete>
                        <!--<v-combobox item-text="name" @change="menu.error=''" v-model="newSupply.supply" :items="Object.values($store.state.supplyList)" label="наименование">-->
                        <!--<template slot="item" slot-scope="data">-->
                        <!--[ {{data.item.articul}} ]   {{data.item.name}}-->
                        <!--</template>-->
                        <!--</v-combobox>-->


                        <v-text-field v-model.number="newSupply.amount" type="number" min="0"></v-text-field>
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
            <v-checkbox label="Лист/таблица" v-model="showAsList"></v-checkbox><v-btn @click="downloadExcel">Excel</v-btn>
            <!--v-btn @click="saveToDatabase" small color="success">Сохранить</v-btn-->
        </v-toolbar>


        <v-container  fluid>
            <v-layout column v-if="type=='отгрузка'">
                <v-card class="no-print" @click="selectRow($event,index)" @dblclick="showEditMenu"
                        :class="{errors:$store.getters.supplyByArticul(row.articul).name===undefined,selected:selectedRowId==index}"
                        v-for="row,index in rows">
                    <v-card-text>
                        <v-layout row wrap>
                            <v-flex xs1>
                                {{index+1}}.
                            </v-flex>
                            <v-flex xs2>
                                {{$store.getters.supplyByArticul(row.articul).TE}}
                                <br> <b>{{$store.getters.supplyByArticul(row.articul).comment}}</b>
                            </v-flex>

                            <v-flex xs4>
                                {{$store.getters.supplyByArticul(row.articul).name}}
                            </v-flex>

                            <v-flex xs1>
                                <h2 :class="{errors:(row.remainAmount!=0)}" >{{row.amount}}</h2>
                            </v-flex>
                            <v-flex xs2>
                                <tr v-for="adr in $store.state.stock[row.articul]">
                                    <td class="px-3 dimmed">{{adr.adr }} {{addressFrequency[adr.adr]?'*'.repeat(addressFrequency[adr.adr].length-1):undefined}}</td>
                                    <td class="px-3 dimmed">{{adr.amount}}</td>
                                    <template v-if="type=='отгрузка'">
                                        <td class="px-10">{{getProp(row.location.find(a=>a.adr==adr.adr),'amount')}}</td>
                                        <td class="px-10 dimmed-blue">{{adr.amount - getProp(row.location.find(a=>a.adr==adr.adr),'amount')}}</td>
                                    </template>
                                </tr>
                            </v-flex>


                        </v-layout>
                    </v-card-text>
                </v-card>
                <table v-if="type=='отгрузка'" class="forPrint at-top">
                    <tbody>
                    <tr v-for="row,ind in rows">
                        <td>{{ind+1}}.</td>

                        <td>{{$store.getters.supplyByArticul(row.articul).TE}}</td>
                        <td>{{$store.getters.supplyByArticul(row.articul).name}}</td>
                        <td class="dim"><h2>{{row.amount}}</h2></td>


                        <template v-for="adr in $store.state.stock[row.articul]">
                            <td>{{adr.adr}} <sup>{{addressFrequency[adr.adr]?'*'.repeat(addressFrequency[adr.adr].length-1):undefined}}</sup></td>
                            <td>{{adr.amount}}</td>
                        </template>
                        <template v-if="$store.getters.supplyByArticul(row.articul).comment">
                        <template  v-for="comadr in $store.getters.supplyByArticul(row.articul).comment.split(';')">
                            <td>{{comadr}}</td>
                            <td class="dim"></td>
                        </template>
                        </template>

                    </tr>
                    </tbody>
                </table>
            </v-layout>
            <v-layout column v-if="type=='приход'">
                <v-card @click="selectRow($event,index)" @dblclick="showEditMenu"
                        :class="{errors:$store.getters.supplyByArticul(row.articul).name===undefined,selected:selectedRowId==index}"
                        v-for="row,index in rows">
                    <v-card-text>
                        <v-layout row wrap>
                            <v-flex xs1>
                                {{index+1}}.
                            </v-flex>
                            <v-flex xs2>
                                {{$store.getters.supplyByArticul(row.articul).TE}}
                                <b>{{$store.getters.supplyByArticul(row.articul).comment}}</b>
                            </v-flex>

                            <v-flex xs4>
                                {{$store.getters.supplyByArticul(row.articul).name}}{{row.remainAmount}}
                            </v-flex>

                            <v-flex xs1>
                                <h2 :class="{errors:(row.remainAmount!=0)}" >{{row.amount}}</h2>
                            </v-flex>
                            <v-flex xs2>
                                <tr v-for="adr in $store.state.stock[row.articul]">
                                    <td class="px-3 dimmed">{{adr.adr }} {{addressFrequency[adr.adr]?'*'.repeat(addressFrequency[adr.adr].length-1):undefined}}</td>
                                    <td class="px-3 dimmed">{{adr.amount}}</td>
                                    <template v-if="type=='отгрузка'">
                                        <td class="px-10">{{getProp(row.location.find(a=>a.adr==adr.adr),'amount')}}</td>
                                        <td class="px-10 dimmed-blue">{{adr.amount - getProp(row.location.find(a=>a.adr==adr.adr),'amount')}}</td>
                                    </template>
                                </tr>
                            </v-flex>
                            <v-flex xs2>
                                <table v-if="type=='приход'">
                                    <tr v-for="loc in row.location">
                                        <td class="px-2">{{loc.adr}}</td>
                                        <td class="px-2">{{loc.amount}}</td>
                                    </tr>
                                </table>
                            </v-flex>

                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-layout>
            <v-layout column v-if="type=='перемещение'">
                <v-card @click="selectRow($event,index)" @dblclick="showEditMenu"
                        :class="{errors:$store.getters.supplyByArticul(row.articul).name===undefined,selected:selectedRowId==index}"
                        v-for="row,index in rows">
                    <v-card-text>
                        <v-layout row wrap>
                            <v-flex xs1>
                                {{index+1}}.
                            </v-flex>
                            <v-flex xs2>
                                {{$store.getters.supplyByArticul(row.articul).TE}}
                                <b>{{$store.getters.supplyByArticul(row.articul).comment}}</b>
                            </v-flex>

                            <v-flex xs4>
                                {{$store.getters.supplyByArticul(row.articul).name}}
                            </v-flex>


                            <v-flex xs2>

                                <tr v-for="adr in row.location.filter(loc=>{return loc.amount<0})">
                                    <td class="px-3">{{adr.adr}}</td>
                                    <td class="px-10">{{Math.abs(adr.amount)}}</td>
                                    <td class="px-3">{{row.location.find(l=>l.m_ind==adr.m_ind&&l.amount>0).adr}}</td>
                                </tr>


                            </v-flex>



                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-layout>

            <!--<pre>{{addressFrequency()}}</pre>-->
            <!--<pre>rowViewer=>{{JSON.stringify(rows,null,2)}}</pre>-->

        </v-container >

    </v-container>
</template>

<script>
    import axios from 'axios'
    import inputMenu from './inputMenu'
    import outputMenu from './outputMenu'
    import XLSX from 'xlsx';
    import saveAs from 'file-saver';

    function s2ab(s) {
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;
    }

    /*json_data={supplies:{},topology:{}}*/
    function toExcel(json_data){
        var wb = XLSX.utils.book_new();
        wb.SheetNames.push("заявка");
        var ws = XLSX.utils.json_to_sheet(json_data);
        wb.Sheets['заявка']=ws
        return new Blob([s2ab(XLSX.write(wb,{bookType:'xlsx',type:'binary'}))],{type:''})
    }

    export default {
        components:{inputMenu,outputMenu},
        props:['rows','type'],
        name: "rowViewer",
        methods:{
            downloadExcel(){
                saveAs(toExcel(
                    this.rows)
                    ,'Заявка '+'#43' +'.xlsx')
            },
            rowChanged(ra){
                console.log('row changed dirty')
                this.rows[this.selectedRowId].remainAmount = ra
                this.$store.commit('setOperation',null)
                this.$emit('changed')
            },
            selectRow(e,index){
                this.selectedRowId = index;
            },

            deleteRow(){
                //       console.log('delete row',this.selectedRowId,this.rows[this.selectedRowId])
                this.rows.splice(this.selectedRowId,1)
                if (this.selectedRowId==this.rows.length) this.selectedRowId=this.rows.length-1
                this.dirty = !this.dirty
            },

            showEditMenu(){
                console.log('showEditMenu')
                this.error=[]
                this.editMenu = true;

            },

            getDown(){
                //var startIndex = this.rows.findIndex(a=>a.id == this.selectedRowId)
                var startIndex = this.selectedRowId;
                if (startIndex==this.rows.length-1) return;
                let swapped=[this.rows[startIndex+1],this.rows[startIndex]]
                this.rows.splice(startIndex,2,swapped[0],swapped[1])
                this.selectedRowId +=1;
                this.$emit('changed');
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
            addressFrequency(){
                if (this.type == 'приход') return {}

                console.log('frequency...')
                var freq={}
                for (var r of this.rows){
                    if (!this.$store.state.stock[r.articul]) continue
                    for (var adr of this.$store.state.stock[r.articul]){
                        console.log(r,adr.adr)
                        if (!freq[adr.adr]) freq[adr.adr]=[r.articul]
                        else freq[adr.adr].push(r.articul)
                    }
                }
                console.log('addr freq ',freq)
                return freq;
            },
            stock(){
                return this.$store.state.stock;
            }

        },
        data(){
            return{
                newLocation:{address:'',amount:0},
                idCount:1000,
                editMenu:false,

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
        /*background-color: ;*/
    }



    table.forPrint td{
        font-size: 0.8em;
        margin: 3px;
        padding:3px;
        border: 2px solid #546E7A;
        border-collapse: collapse;
        width:1%;
    }
    table.forPrint{
        max-width:100%;
        white-space:nowrap;
    }
    .dim{
        background-color: lightblue;
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
        .at-top{
            top:20px !important;
        }
    }
    .errors{
        color:red;
    }

    .hand{
        cursor: pointer;
    }
    .dimmed-blue{
        background-color: powderblue;
    }
    .dimmed{
        background-color: cadetblue;
    }
    v-card#3{
        color:blue;
    }
    .fixed-tabs-bar{
        position: sticky;
        /*top:11.5rem;*/
        top:7.8rem;
        z-index: 2;
    }
    tr td{
        width:1px;
        white-space: nowrap;
    }
    .selected{
        background-color: #90A4AE;
    }
</style>
