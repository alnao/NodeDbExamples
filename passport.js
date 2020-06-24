const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const moongoose = require('mongoose');

require('./models/utenti'); //non serve const
const Utenti=moongoose.model('elencoUtenti');

module.exports = function (passport){
    passport.use(new LocalStrategy( 
        {usernameField : 'email'}, //strategia 
        (email,password//campi del formm
        ,done) =>{ console.log(email);//done serve per il callback
            console.log('cerco'+ email);
            Utenti.findOne({email:email}).then( (utente) => {
                console.log('Utenti find' + utente);//console.log(utente);console.log(err);
                if (!utente){//mail non trovata
                    console.log(utente);
                    return done(null,false, {message:'Email non trovata'});
                }
                console.log(utente.password);
                bcryptjs.compare(password,utente.password, (err,esito)=>{
                    console.log('compare'); //console.log(err);console.log(esito);
                    if (err) { console.log('errore2' + err);
                        return done(null,false, {message:err } ); }
                    if (esito){
                        return done(null,utente );
                    }else{
                        return done(null,false, {message:'Password errata'});
                    }
                });
                //return done(true, utente);
            });
        }
    ));//LocalStrategy
}
