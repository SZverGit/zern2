<template>
    <v-container fluid>

        <v-app-bar app height="125"  class="fixxx no-print">
                <v-container>
                <v-row >
                    <v-col cols="9">
                        <v-row justify="space-around">
                <v-btn @click="scuffold=!scuffold">Показать/скрыть</v-btn>
                <v-btn @click="clearSelect">Очистить выбор</v-btn>
                <v-btn @click="addMovement">Перемещение</v-btn>
                <v-btn @click="makeReplacement">Провести</v-btn>
                        </v-row>

                <v-row justify="space-around" align="baseline">
                <v-col cols="3" offset="1">
                    <v-autocomplete item-text="name" auto-select-first label="добавить адрес" :items="removeNonEmptyFromTopology" v-model="newEmpty"></v-autocomplete>
                </v-col>
                    <v-col>
                        <v-btn @click="addEmpty()">Добавить</v-btn>
                    </v-col>
                    <v-col>
                        <v-col cols="12">
                            <vue-ctk-date-time-picker button-now-translation="Сейчас" noClearButton no-label label="Дата и время" format="YYYY-MM-DDTHH:mm:00" locale="ru"  v-model="stockDate"></vue-ctk-date-time-picker>
                        </v-col>
                    </v-col>
                </v-row>
                    </v-col>
                    <v-col cols="3">

                        <h3>занято паллетомест {{Object.keys(stock).length}}</h3>
                        <h3>ошибки стока {{}}</h3>
                        <v-btn @click="downloadExcel">Excel</v-btn>

                    </v-col>
                </v-row>
                    <!--{{warn}}-->
                <!--projMovements:{{projMovements}}-->
                <!--selected:{{selected}}-->
<!--<pre>{{stock}}</pre>-->
                <!--<br>-->
                <!--маска выбора :-->
                <!--//bpv123 1g0502->1g0802-->
                <!--<br>moving to: {{moveToAddress}}-->
                </v-container>

        </v-app-bar>


        <!--empties-->
        <v-row>
            <v-col cols="6" v-for="emptAdr in empties">
                <address-view :key="emptAdr" :ref="emptAdr"
                              :articules="stock[emptAdr]||[]"
                              :address="emptAdr"
                              :expanded="scuffold"
                              @select="addSelected"
                              @moveTarget="changeMoveTarget"
                              @deleteMovement="deleteMovement">

                </address-view>
            </v-col>
        </v-row>

        <v-row >
            <v-col cols="6" v-for="address in Object.keys(stock).sort()">
        <address-view :key="address" :ref="address"
                      :articules="stock[address]"
                      :address="address"
                      :expanded="scuffold"
                      @select="addSelected"
                      @moveTarget="changeMoveTarget"
                      @deleteMovement="deleteMovement">

        </address-view>
            </v-col>
        </v-row>
        <pre>{{$store.getters.getStockByAddress}}</pre>
    </v-container>
</template>

<script>
    import addressView from './AddressViewer'
    import moment from 'moment'
    import XLSX from 'xlsx'
    import saveAs from 'file-saver';
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;
    }

    function toExcel2(json_data){
        var wb=XLSX.utils.book_new()
        XLSX.utils.new
        console.log('ws = ',ws)
        var range = XLSX.utils.decode_range(ws['!ref'])
    }

    /*json_data={supplies:{},topology:{}}*/
    //[{name:data:}]
    function toExcel(name,json_data){
        var wb = XLSX.utils.book_new();
        wb.SheetNames.push(name);
        var ws=XLSX.utils.aoa_to_sheet(json_data)
        wb.Sheets[name]=ws
        return new Blob([s2ab(XLSX.write(wb,{bookType:'xlsx',type:'binary'}))],{type:''})
    }

    export default {
        name: "stock2",
        components:{addressView},

        computed:{
            topology(){
                return this.$store.state.addressList
            },
            stock(){
                return this.$store.getters.getStockByAddress
            },
            removeNonEmptyFromTopology(){
                return this.topology.filter(
                    el=>{return !this.empties.includes(el.name)&&!Object.keys(this.stock).includes(el.name)})
            }

        },
        methods:{
            downloadExcel(){
                console.log('downExcel')

                var stock = [['адрес','наименование','количество']]
                for (var adr in this.$store.getters.getStockByAddress){
                    console.log(adr,this.$store.getters.getStockByAddress[adr])
                    for (var art of this.$store.getters.getStockByAddress[adr]){
                        console.log(art)
                        stock.push([adr,this.$store.state.supplyList[art.articul].name,art.amount])
                    }
                }

                saveAs(toExcel('Остатки по адресу',
                    stock)
                    ,'Остатки '+new Date().toISOString().substring(0,10) +'.xlsx')
            },
                deleteMovement(b){
                    console.log('delete ',b)
                    this.projMovements=b

                },
                makeReplacement(){
                    console.log('текущая дата ',new Date())
                    this.$store.dispatch('makeMovementV2',{projMovements:this.projMovements,date:new Date()}).then(
                        (res)=>{
                            console.log('resolved::::::',res)
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
                            //this.$store.dispatch('getStockForDate',{date:new Date(),'byAddress':false})
                            console.log('dispatching OperList after res',res)

                            this.projMovements=[]
                            this.$store.dispatch('getOperationList')
                        }
                    )
                },
                clearSelect(){
                    console.log('this.selected ',this.selected)
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

                addEmpty(){
                    if (!this.newEmpty) return
                    this.empties.unshift(this.newEmpty);
                    this.newEmpty = null
                }



        },
        data(){
            return {
                empties:[],
                newEmpty:null,
                show:false,
                mask:'adr*',
                x:100,
                y:100,
                warn:"none",
                stockDate:'',
                moveToAddress:null,
                selected:[],
                projMovements:[],
                scuffold:true,
                //getStockByAddress:{}//getStockByAddress1(this.$store.state.stock,this.selected,this.projMovements)
            }
        },
        watch:{
            stockDate(){
                this.$store.dispatch('getStockForDate',{date:this.stockDate,'byAddress':false}).then(res=>
                    this.$emit('Message',{type:'success',msg:'Сток обновлен на новую дату(дата '+moment(this.stockDate).format('DD/MM/YYYY HH:mm:ss')+")"}))
            },
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
            this.$store.dispatch('getStockForDate',{date:new Date(),'byAddress':false}).then(res=>
                this.$emit('Message',{type:'success',msg:'Сток обновлен (дата '+moment(new Date()).format('DD/MM/YYYY HH:mm:ss')+")"}))
        }
    }
</script>

<style scoped>
    .fixxx{
        top:64px;
    }
</style>