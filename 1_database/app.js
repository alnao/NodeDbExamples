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
*/

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
/*
node app.js
node app.js --nome Alberto
node app.js --cognome Andrea
node app.js --saldo 123
node app.js --attivo
*/