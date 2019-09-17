<template>
    <v-container>
        <v-app-bar app height="110" dark class="fixxx">
            <v-container>
                <v-row>
                    <v-col cols="6">
            <v-row dense justify="space-between"  align="end">
                <v-col cols="6">
                <h2>Заявка {{15}} <span v-if="dirty">***</span> на {{operation.type=='отгрузка'?'отгрузку':operation.type}}</h2>
                </v-col>


    <v-col cols="6">
        <vue-ctk-date-time-picker label="Дата и время" dark format="YYYY-MM-DDTHH:mm:00" locale="ru" v-model="operation.date"></vue-ctk-date-time-picker>
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
                            не размещены: {{operation.info?operation.info.notLocated:null}}, неизвестны: {{operation.info?operation.info.badArt:null}}
                        </v-card-text>
                    </v-card>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="2"><v-row align="center"><v-col><v-btn @click="saveToDB">Сохранить</v-btn></v-col></v-row></v-col>
                </v-row>
            </v-container>
        </v-app-bar>

                    <!--<div class="flex-grow-1"></div>-->


                    <!--<v-toolbar-items>12</v-toolbar-items>-->
                   <!--<v-row>-->
                       <!--<v-col cols="6"><div>-->
                           <!--<h2>Заявка <h2>{{15}}</h2> <span v-if="dirty">***</span> на {{operation.type=='отгрузка'?'отгрузку':operation.type}}</h2>-->
                       <!--</div>-->
                       <!--</v-col>-->
                           <!--<h3>-->
                                <!--<vue-ctk-date-time-picker label="Дата и время" format="YYYY-MM-DDTHH:mm:00" locale="ru" v-model="operation.date"></vue-ctk-date-time-picker>-->
                            <!--</h3>-->
                        <!--</v-flex>-->
                        <!--<v-text-field v-model="operation.comment" @input="dirty=true"></v-text-field>-->
                        <!--<v-btn @click="saveToDB">Сохранить</v-btn>-->
                    <!--Всего позиций:{{operation.rows.length}}-->
                    <!--<br>проблемных артикулов: {{operation.info?operation.info.badArt:null}}, не размещены: {{operation.info?operation.info.notLocated:null}}-->
                   <!--</v-row>-->



           <div v-for="n in 100" class="toTop">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. A cumque dolorem ducimus eos ex exercitationem ipsam ipsum, labore, ratione reiciendis sint totam ullam! Ea id illo maiores maxime numquam voluptates.
       </div>

    </v-container>
</template>

<script>
    import {min} from "moment";
    import ViewColumnIcon from "vue-material-design-icons/ViewColumn";

    export default {
        name: "test",
        components: {ViewColumnIcon},
        data() {
            return {
                dirty:true,

                operation:{
                    name:'звк456',
                    rows:[1,2,3,4,5],
                    info:{
                        badArt:2,
                        notLocated:3
                    },
                    type:'отгрузка',
                    date:null,
                    comment:'some comment to'
                },
                alignmentsAvailable: [
                    'start',
                    'center',
                    'end',
                    'baseline',
                    'stretch',
                ],
                alignment: 'center',
                dense: false,
                justifyAvailable: [
                    'start',
                    'center',
                    'end',
                    'space-around',
                    'space-between',
                ],
                justify: 'center',
            }

    }
    }
</script>

<style scoped>
    .fixxx{
        top:55px;
    }
    .fixed-tabs-bar{
        position: fixed;
        top:55px;

        /*z-index: 3;*/
    }
    .toTop{
        top:10rem;
        color:blue;
    }
</style>