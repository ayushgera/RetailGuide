let express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    alexaVerifier = require('alexa-verifier'),
    intentHandler = require("./intentHandler")(),
    request = require('request');

app.use(bodyParser.json({
    verify: function getRawBody(req, res, buf) {
        req.rawBody = buf.toString();
    }
})); 

//ngrok http 3000 -host-header="localhost:3000"
// ask retail guide where can I find nike shoes

function requestVerifier(req, res, next) {
    alexaVerifier(
        req.headers.signaturecertchainurl,
        req.headers.signature,
        req.rawBody,
        function verificationCallback(err) {
            if (err) {
                res.status(401).json({ message: 'Verification Failure', error: err });
            } else {
                next();
            }
        }
    );
}

/*app.get("/",function(req,res){
    res.end("hello");
})*/

app.post('/intentRequests', requestVerifier, function(req, res) {

    if(!req.body.request.type){
        return;
    }
    let intentName = req.body.request.intent.name.replace(".","_");
    let intentSlots = req.body.request.intent.slots;
    let outputSpeech = "";
    if(typeof intentHandler[intentName] === "function"){
        outputSpeech = intentHandler[intentName](intentSlots);
    }

    res.json({
        "version": "2.0",
        "response": {
          "shouldEndSession": true,
          "outputSpeech": {
            "type": "SSML",
            "ssml": "<speak>"+outputSpeech+"</speak>"
          }
        }
      });
      return;

   /* if (req.body.request.type === 'LaunchRequest' || req.body.request.type === 'IntentRequest') {

        request("http://www.google.com", 
            function(error, response,body)   
             {
                 console.log(body);
                 res.json({
                    "version": "2.0",
                    "response": {
                      "shouldEndSession": true,
                      "outputSpeech": {
                        "type": "SSML",
                        "ssml": "<speak>Hmm <break time=\"1s\"/> I am inside request function</speak>"
                      }
                    }
                  });
                 return;
             }
        );
        
    }*/
});

app.listen(3000);
