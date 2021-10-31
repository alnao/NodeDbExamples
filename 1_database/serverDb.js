const {MongoClient} =require('mongodb'); //oppure  const mongoClient=require('mongodb').MongoClient;
const assert = require('assert');
const url='mongodb://alnao:bello@localhost:27017/admin';

MongoClient.connect(url,(err,client) => {
    assert.equal(null,err);
    console.log("DB OK");
    
    client.db('collectiondemo').collection('listaAnimali')
        .findOneAndUpdate(
            {specie:'cane'} //where
            ,{$set :{nome:'arturo'}} // $set
            , (err,res)=>{ 
                if (err){console.log(`Errore: ${err}`);}
                else{ //in res.ops con gli id inseriti
                    console.log(res);
                }
            }
        );
    client.close();
});
/**/
/*
const url='mongodb://alnao:bello@localhost:27017/admin';
MongoClient.connect(url,function(err,client){
    assert.equal(null,err);
    console.log("DB OK");
    
    const db=client.db('collectiondemo');
    const collection = db.collection('XXXXX');
    var p1={nome:'Alberto',eta:36}
    var p2={nome:'Andreea',eta:28}
    collection.insertMany([p1,p2], function(err,result){
        if (err){
            console.log(err);
        }else{
            console.log("Dati inseriti");
        }
    });
    client.close();
});
*/

