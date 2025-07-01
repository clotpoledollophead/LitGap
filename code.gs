const apiKeys = [
  // put your api keys here
];
for (let i = apiKeys.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [apiKeys[i], apiKeys[j]] = [apiKeys[j], apiKeys[i]];
}
let apiIndex = 0;
function callApi(text,history=[{ role: "user", parts: [{ text: text }] }],model="gemini-2.5-flash-preview-05-20",system_instruction='') {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKeys[apiIndex]}`;
    console.log(apiKeys[apiIndex]);
    
    const data = {
        systemInstruction: {
            parts: [{
                text: system_instruction
            }],            
        },
        generationConfig: {
          "temperature": 1.0,
        },
        contents: history
    };
    const res=UrlFetchApp.fetch(apiUrl, {
        method: 'post',
        contentType: 'application/json',        
        payload: JSON.stringify(data),
        muteHttpExceptions: true
    });
    try{
      const resJson = JSON.parse(res.getContentText());
      var message = resJson.candidates[0].content.parts[0].text;
      console.log(message);
      return message;
    }catch(error){
      console.log(`API ${apiKeys[apiIndex]} failed: ${error.message}`);
      apiIndex = (apiIndex + 1) % apiKeys.length;
      if (apiIndex === 0) {
        throw new Error("All APIs failed");
      } else {
        return callApi(text,history);
      }
    }        
}
function doPost(e) {
  var para = e.parameter; 
  var message = para.mes;
  var history = JSON.parse(para.history); 
  return ContentService.createTextOutput(callApi(message,history));
}
