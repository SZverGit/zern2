<template>
<v-container>
    <v-row align="baseline">
        <v-col cols="2">
            <v-autocomplete item-text="name" label="адрес" @input="getHistory" :items="topology" v-model="address"></v-autocomplete>

        </v-col>
        <v-col cols="1">
            <v-btn @click="reset('address')">
                Сброс
            </v-btn>
        </v-col>

        <v-col cols="4">
            <v-autocomplete item-text="name" label="артикул" @input="getHistory" return-object v-model="supply" :items="Object.values(supplies)">
                <template slot="item" slot-scope="data" >
                    [ {{data.item.articul}} ]  {{data.item.name}}
                </template>
            </v-autocomplete>
        </v-col>
        <v-col cols="1">
            <v-btn @click="reset('articul')">Сброс</v-btn>
        </v-col>

    </v-row>

    <!--<address-view :key="address" :ref="address"-->
                  <!--:articules="stock[address]||[]"-->
                  <!--:address="address"-->
                  <!--:expanded=true-->
                  <!--@select=""-->
                  <!--@moveTarget=""-->
                  <!--@deleteMovement="">-->

    <!--</address-view>-->
    <!--<v-spacer></v-spacer>-->
<!--{{history}}-->
    <v-simple-table v-if="address">
        <tr>
            <th>#</th>
            <th>наименование</th>
            <th>TE</th>
            <th>время</th>
            <th>кол-во</th>
            <th>операция</th>
            <th>итого</th>
        </tr>
        <tbody>
        <tr v-for="d,ind in history">
            <td>{{ind+1}}.</td>
            <td @click="supply=supplies[d[0]];getHistory()" class="hand">{{supplies[d[0]].name}}</td>
            <td>{{supplies[d[0]].TE}}</td>
            <td>{{d[2]|moment}}</td>

            <td nowrap>{{d[1]}}<v-icon  color="green" v-if="d[4]=='отгрузка'">call_made</v-icon>
                <v-icon  color="red" v-if="d[4]=='приход'">call_received</v-icon>
                <v-icon color="blue" v-if="d[4]=='перемещение'">swap_horiz</v-icon></td>
            <td>{{d[3]}}</td>
            <td>{{d[5]}}</td>
        </tr>
        </tbody>
    </v-simple-table>
    <v-simple-table v-if="!address">
        <tr>
            <th>#</th>
            <th>адрес</th>
            <th>кол-во</th>
            <th>операция</th>
            <th>дата</th>
            <th>итого</th>

        </tr>
        <tbody>
        <tr v-for="d,ind in history">
            <td>{{ind+1}}.</td>
            <td class="hand" @click="address=d[0];getHistory()">{{d[0]}}</td>
            <td nowrap>{{d[1]}}<v-icon  color="green" v-if="d[4]=='отгрузка'">call_made</v-icon>
                <v-icon  color="red" v-if="d[4]=='приход'">call_received</v-icon>
                <v-icon color="blue" v-if="d[4]=='перемещение'">swap_horiz</v-icon></td>
            <td>{{d[3]}}</td>
            <td>{{d[2]|moment}}</td>
            <td>{{d[5]}}</td>
        </tr>
        </tbody>
    </v-simple-table>

</v-container>
</template>

<script>
    import moment from 'moment'
    import addressView from './AddressViewer'

    export default {
        name: "Order",
        components:{
          addressView
        },
        methods:{
            reset(what){

              if (what=='address')
                  this.address=''
                if (what=='articul')
              this.supply = {articul:null}
                this.getHistory()

            },
            getHistory(){
                this.$store.dispatch('getHistory',{address:this.address,articul:this.supply.articul}).then(r=>{console.log('history:',r);this.history=r})
            }
        },
        filters:{
            moment(data){
                return moment(data).format('DD/MM/YYYY HH:mm:ss')
            }
        },
        computed:{
            topology(){
                return this.$store.state.addressList
            },
            stock(){
                return this.$store.getters.getStockByAddress
            },
            supplies(){
                return this.$store.state.supplyList
            }
        },
        data(){return {

            address:'',
            supply:{articul:null},
                history:{}
            }
        }
    }
</script>

<style scoped>
    table{
        max-width:100%;
        white-space:nowrap;
    }

    v-simple-table{
        margin:20px;
    }

    .hand{
        cursor: pointer;
    }
    /*table,th,td{*/
        /*margin: 10px;*/
        /*padding:10px;*/
        /*border: 2px solid #546E7A;*/
        /*border-collapse: collapse;*/
        /*width: 50%;*/
        /*!*background-color: ;*!*/
    /*}*/

</style>