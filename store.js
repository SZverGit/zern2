import Vue from "vue";
import Vuex from "vuex";
import axios from 'axios';

Vue.use(Vuex);

const DBAddress = 'http://127.0.0.1:5000/api/'
var date = new Date(2019,6,1,1,1,1,1)
console.log(date)

const vuex = new Vuex.Store({
    state:{
        addressList:[],
        current_operation:{},
        stock:{},//{'дверь1':[{adr:'adr1',amount:34},{adr:'adress2',amount:155}],'Решетка DECOR 125с':[{adr:'address2',amount:555}]},
        supplyList:[],
        operationList:null
    },
    getters:{
        supplyByArticul:(state)=>(articul)=>{
            if (!state.supplyList[articul]) return {'TE':'['+articul+']','name':undefined}
            return state.supplyList[articul];
        },

        getStockByAddress(state) {
        var stock = {}

        for (var art in state.stock) {
            state.stock[art].forEach(
                (i) => {
                if (!stock[i.adr])
                    stock[i.adr] = [];
                stock[i.adr].push({articul: art,amount: i.amount})
            }
        )
    }
    return stock
}

    },


    mutations:{
        setStock(state,stockJson){
            console.log('commited stock ',stockJson)
            this.state.stock = stockJson
        },

        setOperation(state,operationJson){
            console.log('set mut operation')
            if (operationJson==null) return;

            this.state.current_operation = operationJson;
        },

        setOperationList(state,operationList){
            console.log('set oper list',operationList);
            this.state.operationList = operationList;
        },
        setSupplies(state,supplies){
            this.state.supplyList = supplies;
        }

    },
    mounted(){
        console.log('VueX mounted!')
    },

    actions:{
        async login(name,usr_pswd){
            console.log('login: ',usr_pswd)
            return (await axios.post('http://127.0.0.1:5000/login',{'usr':usr_pswd.usr,'pswd':usr_pswd.pswd})).data
        },

        async getOperationList(name,props){
            console.log('get operation list', props)
            if (!props) props={offset:0,limit:10}
            await axios.post(DBAddress+"operationList",{offset:props.offset,limit:props.limit}).then(
                res=>{this.commit('setOperationList',res.data)}
            )
            return 'list get OK'
        },

        async makeMovementV2(name,projMovementsAndDate){
            console.log('отправляю перемещение',projMovementsAndDate)
            await axios.post(DBAddress+"movements/add",{projMovements:projMovementsAndDate.projMovements,date:projMovementsAndDate.date}).then(
                res=>{
                    console.log('перемещение отправлено ',res.data);
                    console.log("::: :::",'date',projMovementsAndDate.date+1)
                this.dispatch('getStockForDate',{'date':projMovementsAndDate.date+1}).then(res=>{console.log('Stock updated',res)});
                }

            )
            return 'movementMade'
        },

        async getHistory(name,data){
            console.log('get History: ',data)
            var res={}
            await axios.post(DBAddress+"history",{address:data.address,articul:data.articul}).then(
                respond=>{res = respond.data}
            )
            console.log(res)
            return res
        },

        async getOperation(name,params){
            console.log('vuex works',params)
            await axios.put(DBAddress+"operation/get",{name:params.name,type:params.type}).then(
                res=>{
                    console.log('vuex get operation',res.data);
                    // console.log('vuex remainAmount ',r.location.reduce((res,n)=>{return res+n.amount},0))
                    for (var r of res.data.rows) r.remainAmount = r.amount - r.location.reduce((res,n)=>{return res+n.amount},0)
                    this.commit('setOperation',res.data);
                    console.log("RES:DATA:DATE",res.data)
                    this.dispatch('getStockForDate',{'date':res.data['date']})}
            )
            return 'opGet'
        },


        async deleteSupply(name,articul){
            console.log('dispatching action deleteSupply2',articul)
            return new Promise((resolve,reject)=>{
                axios.post(DBAddress+'supply/delete',{articul:articul}).then(
                    res=>{this.dispatch('getSupplies');console.log('returned',res.data);resolve(res.data)}

                )
            })


        },
        async getAddresses(){
            axios.get(DBAddress+'topology/get').then(
                res=> {
                    console.log('topchik get',res.data)
                    this.state.addressList = res.data
                })
        },

        async saveOperation(){
            //   axios.post("http://127.0.0.1:5000/api/operation/save",this.$store.state.current_operation).then(res=>{this.dirty=false;this.$store.dispatch('getOperationList')})
            //
            axios.post(DBAddress+'operation/save',this.state.current_operation).then(res=>{this.commit('setOperation',this.state.current_operation);this.dispatch('getOperationList')})
        },

        async getSupplies(){
            axios.get(DBAddress+'supplies/get').then(
                res=>{
                    this.state.supplyList = res.data;
                    for (var sup of Object.keys(this.state.supplyList)){
                        this.state.supplyList[sup].status = ''
                        this.state.supplyList[sup].articul = sup;
                    }
                })
            console.log('getSup')
        },

        async getStockForDate(name,date){
            console.log('=> getStock for date',date)
            /*return Promise.resolve(
              {first:[{address:'1A0101',amount:5},{address:'1C0203',amount:16}],
                second:[{address:'1A0101',amount:5},{address:'1C0203',amount:16}]});*/
            await axios.post(DBAddress+'stock/get',{date:date.date}).then(
                res=>{
                    console.log('беру новый сток!')
                    console.log('еще получаю данные стока',date);
                    console.log('получил данные стока',res)
                    this.commit('setStock',res.data)
                   // return Promise.resolve('OKSTOCK');
                })
            return 'OKStock'
        },

        async deleteOperation(name,params){
            await axios.post(DBAddress+'operation/delete',{name:params.name,type:params.type}).then(
                res=>{
                    console.log('удаление операции')
                    this.dispatch('getOperationList')
                }
            )
        }


    }

})

vuex.dispatch('getSupplies',)
vuex.dispatch('getAddresses')
vuex.dispatch('getOperationList')
vuex.dispatch('getStockForDate',{date:'2020-01-01'})

export default vuex
