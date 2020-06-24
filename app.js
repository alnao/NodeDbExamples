const express = require('express');
const exphbs  = require('express-handlebars');
const app = express(); //istanzio la app
const port =  process.env.PORT || 4200;; //default 4200
const bodyParser = require('body-parser');
const bcryptjs=require('bcryptjs');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session'); 
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const methodOverride = require('method-override')
app.use(methodOverride('_method'));

const {accessoSicuro} = require('./accesso_privato');

//connessione DB 
const moongoose = require('mongoose');
moongoose.Promise= global.Promise;

let db_url = 'mongodb://alnao:bello@localhost:27017/collectiondemo';
if (process.env.NODE_ENV === 'production'){ 
  db_url = 'mongodb://PNrbctwK6pCJF3TD:PNrbctwK6pCJF3TD@cluster0-shard-00-00-tkrby.mongodb.net:27017,cluster0-shard-00-01-tkrby.mongodb.net:27017,cluster0-shard-00-02-tkrby.mongodb.net:27017/note-prod?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';
}
moongoose.connect(db_url,{useMongoClient: true}
).then( () => {console.log("DB connesso");}
).catch( err => {console.log("DB NON connesso: " + err);return err;} );
//gestione del modello
require('./models/note'); //non serve const
const Note=moongoose.model('elencoNote');

require('./models/utenti'); //non serve const
const Utenti=moongoose.model('elencoUtenti');


//SESSIONE E FLASH
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 60000 },
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));
app.use(flash());

//password user
require('./passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
////login_execute
app.post('/login_execute',(req,res,next) => {
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
  })(req,res,next);
});
app.get('/logoff',(req,res) => {
  req.logout();
  req.flash('msg_successo','Utente disconnesso');
  res.redirect('/');
});
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Utenti.findById(id, function(err, user) {
    done(err, user);
  });
});

//VARIABILI GLOBALI per messaggi flash
app.use ( (req,res, next) => {
  res.locals.msg_successo = req.flash('msg_successo');
  //NOTA IMPORTANTE, una volta chiamato req.flash('msg_successo');, il contenuto viene svuotato, come una coda
  res.locals.msg_errore = req.flash('msg_errore');
  res.locals.errore = req.flash('errore');
  res.locals.error = req.flash('error');
  res.locals.user = req.user;
  next();
} );

app.use('/css', express.static(__dirname + '/assets/css'));

//Uso di handlebars
app.engine('handlebars', exphbs({defaultLayout : 'main'}));
app.set('view engine','handlebars');


//ROUTE PER PAGINA INDEX
app.get('/',(req,res) => {
  const titolo="Pagina home del corso";
  res.render('home', { titolo : titolo } );
});
//ROUTE 
app.get('/lista',accessoSicuro,(req,res) => {
  Note.find({utente : req.user.id}).sort({date:'desc'})
    .then( listaNote => { 
      res.render ('lista',{listaNoteInPagina : listaNote});
    });
});
//ROUTE MODIFICA 
app.get('/modifica/:id',(req,res) => { //url modifica con parametro id
  Note.findOne({_id : req.params.id})//prende id dalla request e mette in variabile
  .then ( nota => { //quando recupera la nota
    res.render ('modifica',{nota:nota}); //render della pagina con parametro nota
  }); 
});
app.get('/modifica', (req,res) => {
  res.render ('modifica'); //render della pagina con parametro nota
});
app.post('/modifica_salva/:id',(req,res) => {//metodo di aggiornamento
  console.log('aggiungi nota');// 
  console.log(req.body);
  //validazione dei campi
  let errori = []; // array degli errori
  if (!req.body.titolo){
    errori.push({text:'Titolo obbligatorio'});
  }
  if (!req.body.contenuto){
    errori.push({text:'Contentuto obbligatorio'});
  }
  if (errori.length>0){//se ci sono errori
    Note.findOne({_id : req.params.id})//prende id dalla request e mette in variabile
    .then ( nota => { //quando recupera la nota
      res.render ('modifica',{nota:nota}); //render della pagina con parametro nota
    }); 
  }else{
    Note.findOne({_id : req.params.id})//cerco la nota da cambiare
    .then ( nota => { 
      nota.titolo = req.body.titolo;
      nota.contenuto = req.body.contenuto;
      nota.save()//salvataggio
      .then (nota => {
        req.flash('msg_successo','Nota aggiornata con successo');
        res.redirect('/lista');//fatto vado in note
      })
    });
  }
});

app.post('/cancella_nota/:id', (req,res) =>{
  Note.remove({_id : req.params.id})//cerco la nota da cambiare
  .then (nota => {
    req.flash('msg_successo','Nota cancellata con successo');
    res.redirect('/lista');//fatto vado in note
  });
});


app.get('/nuova',(req,res) => {res.render ('nuova');});
app.get('/info',(req,res) => {res.render ('info');});
app.post('/aggiungi_nota',(req,res) => {
  console.log('aggiungi nota');// 
  console.log(req.body);
  //validazione dei campi
  let errori = []; // array degli errori
  if (!req.body.titolo){
    errori.push({text:'Titolo obbligatorio'});
  }
  if (!req.body.contenuto){
    errori.push({text:'Contentuto obbligatorio'});
  }
  if (errori.length>0){//se ci sono errori
    res.render ('nuova', {
        errori:errori,
        titolo:req.body.titolo,
        contenuto:req.body.contenuto
    } );
  }else{
    const nuovaNota={ //oggetto da inserire
      titolo : req.body.titolo, 
      contenuto : req.body.contenuto,
      utente : req.user.id
    } 
    new Note(nuovaNota).save()
    .then(noteResp =>{ console.log('nota inserita');
      req.flash('msg_successo','Nota inserita con successo');
      res.redirect('/lista');//fatto vado in note
    });
  }
});

app.get('/login',(req,res) => {res.render ('login');});
app.get('/registrazione',(req,res) => {res.render ('registrazione');});

app.post('/registrazione_execute',(req,res) => {console.log('Ingresso');
  let errori = []; // array degli errori
  if (req.body.password != req.body.password2){
    errori.push({text:'Password non confermata'});
  }
  if (!req.body.password){
    errori.push({text:'Password campo obbligatorio'});
  }
  if (!req.body.email){
    errori.push({text:'Email campo obbligatorio'});
  }
  if (errori.length>0){//se ci sono errori
    res.render ('registrazione', {
        errori:errori,
        email:req.body.email,
        nome:req.body.nome,
        cognome:req.body.cognome,
    } );
  }else{console.log('Cerco se presente');
    //cerco se presente
    Utenti.findOne({email: req.body.email }).then (utenteE =>{
      if (utenteE){//gia presente--> errore
        errori.push({text:'Mail già presente'});
        res.render ('registrazione', {
          errori:errori,
          email:req.body.email,
          nome:req.body.nome,
          cognome:req.body.cognome,
        } );
      }//non presente quindi lo inserisco
        const nuovoUtente= new Utenti({ 
          nome : req.body.nome,
          cognome : req.body.cognome,
          email : req.body.email,
          password :req.body.password
        });
        console.log('utente ok, scripto la password');
        bcryptjs.genSalt(10, (err,salt) =>{console.log('salt '); //cripto la password
          bcryptjs.hash(nuovoUtente.password , salt, (err, hash)=>{console.log('salt fatto');
            if (err) throw err;
            nuovoUtente.password = hash;//ha ritornato la password criptata
            //salvo il cliente con la password criptata
            nuovoUtente .save().then(utenteResp =>{ console.log('utente inserito'); //gestione response
              req.flash('msg_successo','Utente inserito con successo');
              res.redirect('/login');
            }).catch(err => {console.log('errore');
              console.log(err);
              return;
            });
          });
        });
    });
  }
});




app.get('/error',(req,res) => {res.render ('login');});
//APP LISTEN
app.listen (port, () => {
  console.log( `server in ascolto sulla porta; ${port}`);
});




/*
//Definiamo middleware
app.use( (req,res,next) => {
  req.saluto = 'Saluti a chi entra in pagina';
  next();
});
//ROUTE PER PAGINA SALUTI 
app.get('/saluti',(req,res) => {
  res.send (req.saluto);
});


//ROUTE PER PAGINA INDEX
app.get('/',(req,res) => {
  res.send ('io sono la pagina iniziale');
});

//ROUTE PER PAGINA INFO
app.get('/info',(req,res) => {
  res.send ('Informazoni');
});

//APP LISTEN
app.listen (port, () => {
  console.log( `server in ascolto sulla porta; ${port}`);
});


/*
const moongoose = require('mongoose');
moongoose.Promise= global.Promise;
//mongodb://alnao:bello@localhost:27017/admin
moongoose.connect('mongodb://alnao:bello@localhost:27017/collectiondemo',{useMongoClient: true});

//definizione dello schema e controllo del modello su Mongo
const libriSchema=moongoose.Schema({
  titolo : String,
  autore: String,
  prezzo: Number,
  disponibile: Boolean
});
//definizione modello <--> documento
const Libro = moongoose.model(
  'Libro' //nome documento
  ,libriSchema //nome dello schema
);
Libro.findById("5ece73beef660b63d2a38292",(err,libro)=>{
  if (err){return console.log(err);}
  console.log(libro);  
  libro.set({prezzo:42.17});
  libro.save((err,doc)=>{
    if (err){return console.log(err);}
    console.log(doc);  
  })
})


console.log(`app.js end`);



/*
	//istanza di un modello
	const aggiungiLibro2=new Libro({
	  titolo:'Anelli',
	  autore: 'Tolkien',
	  prezzo: 42,
	  disponibile: true
	});
	aggiungiLibro2.save((err,doc) => {
	  if (err){return console.log(err);}
	  console.log(doc);
	});
*/


/*
//istanza di un modello
const aggiungiLibro2=new Libro({
  titolo:'Anelli',
  autore: 'Tolkien',
  prezzo: 42,
  disponibile: true
});
aggiungiLibro2.save((err,doc) => {
  if (err){return console.log(err);}
  console.log(doc);
});
*/




/*
  const os = require('os');
  //console.log( os.cpus() ); 
  let utente=os.userInfo().username;
  console.log( utente );

  const fs = require('fs');
  let adesso=new Date();
  let testo=`Eseguito da ${utente} in data ${adesso}\n`;
  fs.appendFile('message.txt', testo, (err) => {
    if (err) throw err;
    console.log(testo + 'was appended to file!');
  });
*/
/*
  const infoStudente=require('./studenti.js');
  console.log(infoStudente);
*/

// https://nodejs.org/dist/latest-v12.x/docs/api/process.html
/*
  process.on('beforeExit', (code) => {
    console.log('Process beforeExit event with code: ', code);
    });
  process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
  });


const lineaComando=require('command-line-args');
const definizioni=[
  {name:'nome',type:String},
  {name:'cognome',type:String},
  {name:'saldo',type:Number},
  {name:'attivo',type:Boolean}
];
const opzioni = lineaComando(definizioni);
if (opzioni.nome){
  console.log(`Dato nome ${opzioni.nome}`);
}else if(opzioni.cognome){
  console.log(`Dato cognome ${opzioni.cognome}`);
}else if(opzioni.saldo){
  console.log(`Dato saldo ${opzioni.saldo}`);
}else if(opzioni.attivo){
  console.log(`Dato attivo ${opzioni.attivo}`);
}else {
  console.log(`Nessun dato`);
}
*/
/*
node app.js
node app.js --nome Alberto
node app.js --cognome Andrea
node app.js --saldo 123
node app.js --attivo
*/