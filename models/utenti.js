const moongoose = require('mongoose');
const Schema = moongoose.Schema;
const utentiSchema = new Schema({
    nome : {type: String, require: true },
    cognome : {type: String, require: true },
    email : {type: String, require: true },
    password : {type: String, require: true },
    data : {type: Date, default : Date.now }
});
moongoose.model('elencoUtenti', utentiSchema); //elencoUtentis documento in Mongo
