const moongoose = require('mongoose');

const noteSchema = moongoose.Schema({
    titolo : {type: String, require: true },
    contenuto : {type: String, require: true },
    utente : {type: String, require: true },
    data : {type: Date, default : Date.now }
});

moongoose.model('elencoNote', noteSchema); //elencoNote documento in DB
