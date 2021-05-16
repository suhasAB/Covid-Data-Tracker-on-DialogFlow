// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
const axios = require('axios');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  function covidDataHandler(agent){
  	var countryName=agent.parameters.nation.split(' ').join('-');
    var cName; 
	switch (countryName) {
  		case "United-States":
        	cName = "USA";
   			break;
        case "United-Kingdom":
   		 	cName = "UK";
   		 	break;
        case "United-Arab-Emirates":
     		cName = "UAE";
    		break;
        case "South-Korea":
     		cName = "S-Korea";
    		break;
        default:
    		cName = countryName;
    		break;

        }
    
    //agent.add(`Intent Called for:`+countryName);
    
	return axios({
    "method":"GET",
    "url":"https://covid-193.p.r
    dapi.com/statistics?country="+cName,
    "headers":{
    "content-type":"application/octet-stream",
    "x-rapidapi-host":<enter your API hostname here in double quotes>
    "x-rapidapi-key":<enter your key here in double quotes>
    }
    })
    .then((result)=>{
      const info=result.data['response'][0];
      const country1=result.data['response'][0]['country'];
      var newCases= info['cases']['new']
      const activeCases= info['cases']['active']
      const criticalCases= info['cases']['critical']
      const recoveredCases= info['cases']['recovered']
      const totalCases= info['cases']['total']
      var newDeaths=info['deaths']['new']
      const totalDeaths=info['deaths']['total']
      const timeOfData=info['time']
      if(newCases==null){newCases="NA";}
      if(newDeaths==null){newDeaths="NA";}
      
      


      	  agent.add('stats of '+country1+' as on '+timeOfData+'\n'+'\n'+
        '\n'+'\n'+          
	  '\nCritical cases  : '+criticalCases+'\n'+'\n'+
	  
	  '\nActive cases    : '+activeCases+'\n'+'\n'+
	  '\nrecovered cases : '+recoveredCases+'\n'+'\n'+
	  '\ntotal cases     : '+totalCases+'\n'+'\n'+
	  
	  '\ntotal deaths    : '+totalDeaths+'\n'+'\n'+'\n'+
	  
       '\nData of last 24 hrs'+
       '\nNew cases       : '+newCases+
	  '\nnew deaths      : '+newDeaths);
      


      
    })
    .catch((error)=>{
      agent.add(error);
    });
    
  }


  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('GetData', covidDataHandler);

  agent.handleRequest(intentMap);
});
