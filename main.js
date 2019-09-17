import Vue from 'vue'
import App from './App.vue'

import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'


Vue.config.productionTip = false

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

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')


Vue.use(vuetify)
Vue.component('vue-ctk-date-time-picker',VueCtkDateTimePicker)

Vue.mixin({

    methods: {
        getProp(obj, key) {
            if (!obj) return null;
            return obj[key]
        }
    }
})
