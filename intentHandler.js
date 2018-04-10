let jsonFile = require('jsonfile'),
sendNotificationService = require("./main.js")();

module.exports= function(){
    var FindItemIntentHandler = function(args){
        var outputSpeech = "";
        if(!(args["itemName"] && args["itemName"].value)){
            outputSpeech = "Unfortunately I am unable to locate this item." 
            return outputSpeech;
        }
        var item = args["itemName"].value;
        var currentUser= getCurrentVoiceId();
        var itemMap = jsonFile.readFileSync("./ItemMapping.json");
        var outputSpeech = searchItem(item, currentUser, true);
        
        //sendNotificationService.sendNotification("I have pushed some updates");
        return outputSpeech;
    }

    var AMAZON_HelpIntentHandler = function(){
        var outputSpeech = "I can tell you exactly where <emphasis level='strong'>each</emphasis> item is. I can give you product recommendations based on current trends. "+
        "I can also help you by providing product information. I'll accompany you as you shop. ";
        return outputSpeech;
        
    }

    /**
     * get pronoun
     * with User input, find user's searched Items
     * replace pronoun with searched Item 
     * use Finder Intents search algorithm and give response
     * @param {args} args 
     */
    var CheckPreviousIntentHandler = function(args){

        if(!(args["itemPronoun"] && args["itemPronoun"].value)){
            return "I'm sorry. I'm unable to understand.";
        }
        var currentUser= getCurrentVoiceId();
        var userInfo = getUserInformation(currentUser);
        if(!userInfo || Object.keys(userInfo).length === 0){
            return "What is it that you're looking for again?";
        }
        return searchItem(userInfo.lastContext);
    }

    var searchItem = function(searchItem, currentUser, save){
        if(!searchItem || (save && !currentUser)){
            return "Something went wrong!"
        }
        var outputSpeech="";
        var itemMap = jsonFile.readFileSync("./ItemMapping.json");
        if(itemMap.hasOwnProperty(searchItem)){
            outputSpeech = "You can find " +searchItem +" in "+itemMap[searchItem];
            if(save){
                var saved= saveSearchedItemInContext(currentUser,searchItem);
                console.log("Context saved: "+saved);
            }
        }else{
            outputSpeech = "Unfortunately I am unable to locate this item.";
        }
        return outputSpeech;
    }

    /**
     * extract from the user context returned from identification api
     */
    var getCurrentVoiceId = function(){
        return "123455678";
    }

    var getUserInformation = function(userId){
        var userInfoMap= jsonFile.readFileSync("./UserInformation.json");
        if(!userInfoMap || Object.keys(userInfoMap).length<1){
            return null;
        }
        return userInfoMap[userId];
    }

    var saveSearchedItemInContext = function(currentUser, item){
        var userInfoMap= jsonFile.readFileSync("./UserInformation.json");
        
        if(userInfoMap && Object.keys(userInfoMap).length>0 && 
            userInfoMap[currentUser] &&  userInfoMap[currentUser].searchedItems){
            userInfoMap[currentUser].searchedItems.push(item);
            userInfoMap[currentUser].lastContext=item;
            jsonFile.writeFileSync("./UserInformation.json", userInfoMap, {spaces: 2, EOL: '\r\n'});
            return true;
        }
        
        return false;
    }   
    
    return {
        FindItemIntent: FindItemIntentHandler,
        AMAZON_HelpIntent:AMAZON_HelpIntentHandler,
        CheckPreviousIntent : CheckPreviousIntentHandler
    }
}