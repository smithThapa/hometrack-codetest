const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
let db;

// MongoClient.connect('mongodb+srv://smith_thapa:<Lukaku88>@cluster0-tl71f.mongodb.net/test?retryWrites=true'
//  ||  'mongodb://localhost:27017/Payload', (err,client) => {
//     if (err){
//         return console.log('Unable to connect to MongoDB server');
//     }
//     console.log('Connected to MongoDB server');
//     db = client.db('Payload');
// })


const uri = "mongodb+srv://smith_thapa:<Lukaku88>@cluster0-tl71f.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
     if (err){
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    db = client.db("Payload");
});

app.use(bodyParser.json());

app.post('/payload', (req, res) => {
    let payloadArray = [];
    let error = false;

    req.body.payload.forEach(payload => {
        db.collection('payload').insertOne(payload,
             (err, result) => {
                    if(err){
                        error = true;
                        return console.log('Unable to insert payload', err);
                    }
                })
    })

    if(!error){
        db.collection('payload').find(
            {"type": "htv",
            "workflow": "completed"}).toArray().then((docs) => {
                for (let index = 0; index < docs.length; index++) {
                    let buildingNumber = docs[index].address.buildingNumber;
                    let street = docs[index].address.street;
                    let suburb = docs[index].address.suburb;
                    let postcode = docs[index].address.postcode;

                    payloadArray[index] = {
                        "concataddress": `${buildingNumber} ${street} ${suburb} ${postcode}`, 
                        "type": "htv",
                        "workflow": "completed"
                    }
                    
                }

                let responseObj = {
                    "response": payloadArray
                }
                console.log("yolo");
                console.log(JSON.stringify(responseObj,undefined,2));
            }, (err) => {
                console.log('Unable to fetch payloads',err);
            })
    }
})

app.listen(port, () => {
    console.log(`Started on port ${port}`);
})