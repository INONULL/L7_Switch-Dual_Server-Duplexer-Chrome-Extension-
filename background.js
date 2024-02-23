///////////////Created 2023.12.20 Lee JunSung
var tab = null ;
var windowid = null;
var tab_dagragging = false;
var lasttabUsed = null;
var currenturl = null;
var Primary_Response = null; //Print Response.status (P)
var Secondary_Response = null; //Print Response.status (S)
var onoff = false; // later use
var mon_started = false;
////////////////////////////popup.js////////////////////////////////
var alive = false;
////////////////////////////////////////////////////////////////////
var http_https = null;
////////////////////////////////////////////////////////////////////////////////////////
const Primary = '127.0.0.1:8080' //Target Server 1
const Secondary = '127.0.0.1:8181' //Target Server 2
const kma_mon_end_point= ''; // /ewms/main/userMain.do
const target_end_point = '/favicon.ico'; 
////////////////////////////////////////////////////////////////////////////////////////
var Primary_Down = false;
var Primary_Module_Down = false;
var Secondary_Down = false;
var Secondary_Module_Down = false;
var Servers_Are_Down = false;
var Servers_Are_Down_Log = false;
var Modules_Are_Down = false;
var Modules_Are_Down_Log = false;
var Primary_Log = false;
var Secondary_Log = false;
var Primary_Module_Log = false;
var Secondary_Module_Log = false;
var Primary_up_again = false;
var Secondary_up_again = false;
var Primary_up_again_log = false;
var Secondary_up_again_log = false;
var Servers_are_up_again = false;
var Servers_are_up_again_log = false; // later fix
var Primary_module_up_again = false;
var Secondary_module_up_again = false;
var Modules_Are_Up_Again = false;
var Secondary_up_Primary_up_again = false;
var Primary_up_Secondary_up_again = false;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.log("Automatic_Switching_Program_under_Multi_Servers_[ASPS]_L7_Auto_Switching(Duplexer)");
console.log("__by LEE JUNSUNG");
//////////////////////////////////////////////<BG_2_Popup>////////////////////////////////////////////////////////
chrome.runtime.onMessage.addListener(function(request){ // Background to Popup
  if(request.message.includes('signal')){
    chrome.runtime.sendMessage({
        signal: alive, 
        PSD: Primary_Down,
        SSD: Secondary_Down,
        PMD: Primary_Module_Down,
        SMD: Secondary_Module_Down,
        last_tab: lasttabUsed,
        window_id: windowid
    });
  }
});
/////////////////////////////////<Tab_Close_handler>///////////////////////////////////
chrome.tabs.onRemoved.addListener(function(tabid) { // tab exit handling
 if(tabid == lasttabUsed){
    tab = null;
    mon_started = false;
    Primary_Log = false;
    Secondary_Log = false;
    Servers_Are_Down_Log = false;
    Modules_Are_Down_Log - false;
    Servers_are_up_again_log = false;
///  
    Primary_Down = false;
    Secondary_Down = false;
    Servers_Are_Down = false
    Primary_Module_Down = false;
    Secondary_Module_Down = false;
    Modules_Are_Down = false;
 }
 mon_started = false;
});
//////////////////////////////////////////////////////////////////////////
var Chrome = { /// https://stackoverflow.com/questions/25470728/how-to-find-out-if-a-user-is-dragging-a-tab (Daniel Hilgarth)
  isUserDragging: function (callback) {
      chrome.windows.getAll({ populate: true }, function (windows) {
          var window = windows.filter(function (x) {
              return x.type === 'normal' && x.focused && x.tabs
                     && x.tabs.length;
          })[0];
          if (window === undefined)
              return;
          var tab = window.tabs[0];
          chrome.tabs.move(tab.id, { index: tab.index }, function () {
              callback(
                  chrome.runtime.lastError !== undefined &&
                  chrome.runtime.lastError.message.indexOf('dragging') !== -1);
          });
      });
  }
}

//KeepAlive Chrome Extension
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

// Background to audio
async function playMP3(source, volume = 1) {
  await createOffscreen();
  await chrome.runtime.sendMessage({ play: { source, volume } });
}
async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
      url: 'offscreen_audio.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'alert'
  });
}

chrome.declarativeNetRequest.updateDynamicRules({ // Avoid Caching the target
  addRules: [
    {
      "id": 1,
      "priority": 1,
      "action": {
        "type": "modifyHeaders",
        "requestHeaders": [          
          { "header": "Cache-Control", "operation": "set", "value": "no-cache" },
          { "header": "Pragma", "operation": "set", "value": "no-cache" },
          { "header": "Expires", "operation": "set", "value": "0" }
        ]
      },
      "condition": {
        "urlFilter": Primary+target_end_point
        //"resourceTypes": ["main_frame", "sub_frame"]
      }
    },
    {
      "id": 2,
      "priority": 2,
      "action": {
        "type": "modifyHeaders",
        "requestHeaders": [          
          { "header": "Cache-Control", "operation": "set", "value": "no-cache" },
          { "header": "Pragma", "operation": "set", "value": "no-cache" },
          { "header": "Expires", "operation": "set", "value": "0" }
        ]
      },
      "condition": {
        "urlFilter": Secondary+target_end_point
       // "resourceTypes": ["main_frame", "sub_frame"]
      }
    },
  ],
  removeRuleIds: [1,2]
});

setInterval(() => {
const timestamp = Date.now();
const currentDate = new Date(timestamp);
const hours = currentDate.getHours().toString().padStart(2, '0');
const minutes = currentDate.getMinutes().toString().padStart(2, '0');
const seconds = currentDate.getSeconds().toString().padStart(2, '0');

// UserDefine Timeout, Keep for later use //
//const controllerPrimary = new AbortController();
//const signalPrimary = controllerPrimary.signal;
//const timeoutPrimary = setTimeout(() => controllerPrimary.abort(), 100);
//const controllerSecondary = new AbortController();
//const signalSecondary = controllerSecondary.signal;
//const timeoutSecondary = setTimeout(() => controllerSecondary.abort(), 100);

///////////////////// Tab Searching Logic&handler/////////////////////////////////////////////////
try{
  Chrome.isUserDragging(function(userIsDragging) {
    if(userIsDragging)
    tab_dagragging = true;
    else
    tab_dagragging = false;
  });
  if(tab_dagragging == false){
    chrome.tabs.query({}, function (tabs) {
      if(mon_started==false){
        alive = false;
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.toString().includes(Primary) | tabs[i].url.toString().includes(Secondary)) {
            if (tabs[i].url.toString().includes('http://')) {
                http_https = 'http://';
            } else if (tabs[i].url.toString().includes('https://')) {
                http_https = 'https://';
            } else {
                http_https = 'http://';
            }
            if(tab != i){
            tab = i;
            lasttabUsed = tabs[i].id;
              console.log('Tatget Url detected: ' + tabs[tab].url + ' on tab['+tab+']Id: ' + lasttabUsed);
              //chrome.tabs.update(lasttabUsed, {highlighted: true}); //option
              chrome.notifications.create('monitoring_tab', { // <tab location noti>
                type: 'basic',
                title: 'Current monitoring tab:  [tabId: ' + lasttabUsed  + ', tabId: ' + tab + ']',
                iconUrl: 'monitoring.png',
                message: '[tabId:'  + lasttabUsed  + ', tabId: ' + tab + ']',
                priority: 1
              });
              chrome.notifications.clear("monitoring_tab"); // clear noti mem
              if(tabs[tab].url.toString().includes(Primary)){
                console.log('Monitoring target changed to ' + Primary + '  tab['+tab+']Id: ' + lasttabUsed);
              }else if(tabs[tab].url.toString().includes(Secondary)){
                console.log('Monitoring target changed to ' + Secondary + '  tab['+tab+']Id: ' + lasttabUsed);
              }}
              mon_started = true;
          }}}
      if(mon_started){
        if(currenturl != tabs[tab].url.toString()){ //Hanlding, Monitor Primary Down -> (Program)Monitor Secondary -> (User)Force into Primary -> (Program)Force Back to Secondary
          if(Servers_Are_Down | Modules_Are_Down){
            //ignore
          }else if(Primary_Down | Primary_Module_Down){
            if(tabs[tab].url.toString().includes(Primary)){
              chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Secondary + kma_mon_end_point});
              playMP3('47_48.mp3'); // Server 47 Not usable -> Monitor 48
            }
          }else if(Secondary_Down | Secondary_Module_Down){
            if(tabs[tab].url.toString().includes(Secondary)){
              chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Primary + kma_mon_end_point});
              playMP3('48_47.mp3'); // Server 48 Not usable -> Monitor 47
            }
          }
        }
        currenturl = tabs[tab].url.toString();
        windowid = tabs[tab].windowId; // windowid!
          if (!(currenturl.includes(Primary) | currenturl.includes(Secondary))) {
            console.log(lasttabUsed + ' Url !=  (' + Primary +', ' +Secondary+')  '  + hours + ':' + minutes + ':' + seconds);
            mon_started = false;
          }}});
//////////////////////////////////////////<tab logic end>///////////////////////////////////////////////////          
///////////////////////////////////////////////////////////////<Main logic>///////////////////////////////////////////////////////////////////////////
if(mon_started){ 
  alive = true; // alive
  if((Servers_Are_Down|Modules_Are_Down)&Servers_are_up_again_log==false){
    async function servers_down_f() {
      let primary_server_servers_down = fetch(http_https + Primary + target_end_point, { method: 'GET', credentials: 'omit', /*signal: signalPrimary,*/}).then(Response => {
      //clearTimeout(timeoutPrimary);
            if(Response.ok){
              Servers_are_up_again_log = false;
              Servers_Are_Down = false;
              Modules_Are_Down = false;
              Primary_up_again = false;
              Primary_module_up_again = true;
              Primary_Module_Down = false;
              Servers_Are_Down_Log = false;
              Modules_Are_Down_Log = false;
            }else if(!Response.ok){
              Primary_Response = Response.status; // Return Response
              Primary_up_again = true;
              Servers_Are_Down = false;
              Primary_Module_Down = true;
              Servers_Are_Down_Log = false;
            }
            Primary_Down = false;
            // Primary_Log = false;
      }).catch(error=> Primary_Down = true, Primary_Module_Down = true /*clearTimeout(timeoutPrimary)*/);
      let secondary_server_servers_down = fetch(http_https + Secondary + target_end_point, { method: 'GET', credentials: 'omit', /*signal: signalSecondary,*/}).then(Response => {
      //clearTimeout(timeoutSecondary);
            if(Response.ok){
              Servers_are_up_again_log = false;
              Secondary_up_again = false;
              Secondary_module_up_again = true;
              Servers_Are_Down = false;
              Modules_Are_Down = false;
              Secondary_Module_Down = false;
              Servers_Are_Down_Log = false;
              Modules_Are_Down_Log = false;
            }else if(!Response.ok){
              Secondary_Response = Response.status; // Return Response
              Secondary_up_again = true;
              Servers_Are_Down = false;
              Secondary_Module_Down = true;
              Servers_Are_Down_Log = false;
            }
            Secondary_Down = false;
            // Secondary_Log = false;
      }).catch(error=> Secondary_Down = true, Secondary_Module_Down = true /*clearTimeout(timeoutSecondary)*/);
      await primary_server_servers_down;
      await secondary_server_servers_down;
    }
    servers_down_f();
    }
    if(Servers_Are_Down==false|Modules_Are_Down==false|Servers_are_up_again_log==true){
      async function server_check_f() {
        let primary_server = fetch(http_https + Primary + target_end_point, { method: 'GET', credentials: 'omit', /*signal: signalPrimary*/ })
        .then(Response => {
            Primary_Log = false;
            Primary_up_again_log = false;
            if(Response.ok){
              Servers_are_up_again_log = false;
                if(Primary_Down == true & Secondary_Down == false){
                  Secondary_up_Primary_up_again = true;
                  Modules_Are_Up_Again = true; //정상
                }
                Primary_Down = false;
                if(Primary_Module_Down & Secondary_Module_Down == false){
                  Primary_module_up_again = true;
                  Modules_Are_Up_Again = true; //정상
                }
                Primary_Module_Down = false;
                Primary_Module_Log = false;
                Primary_up_again = false;
            }else if(!Response.ok){ // Module ↔ Server Log 
                Primary_Response = Response.status; // Response
                if(Secondary_up_again == true){
                  Servers_are_up_again = true;
                }
                Primary_Module_Down = true;
            }})
        .catch(error => {
            if (Primary_Down == false) {
                console.log(Primary + ' is Down   ' + hours + ':' + minutes + ':' + seconds + '   ' + error);
            }            
            Primary_Down = true;
            Primary_Module_Down = true;
        });
        let secondary_server = fetch(http_https + Secondary + target_end_point, { method: 'GET', credentials: 'omit', /*signal: signalSecondary*/ })
        .then(Response => {
            Secondary_Log = false;
            Secondary_up_again_log = false;
            if(Response.ok){
              Servers_are_up_again_log = false;
              if(Secondary_Down == true & Primary_Down == false){
                Primary_up_Secondary_up_again = true
                Modules_Are_Up_Again = true; //정상
              }
                Secondary_Down = false;
                if(Secondary_Module_Down & Primary_Module_Down == false){
                  Secondary_module_up_again = true;
                  Modules_Are_Up_Again = true; //정상
                }
                Secondary_Module_Down = false;
                Secondary_Module_Log = false
                Secondary_up_again = false;
            }else if(!Response.ok){ // Module ↔ Server Log
                Secondary_Response = Response.status; // Response
                if(Primary_up_again == true){
                  Servers_are_up_again = true;
                }
                  Secondary_Module_Down = true;
            }})
        .catch(error => {
            if (Secondary_Down == false) {
                console.log(Secondary + ' is Down   ' + hours + ':' + minutes + ':' + seconds + '   ' + error);
            }            
            Secondary_Down = true;
            Secondary_Module_Down = true;
            //Secondary_Module_Down = true;
        });
        Servers_Are_Down = (Primary_Down & Secondary_Down);
        Modules_Are_Down = (Primary_Module_Down & Secondary_Module_Down);
        await primary_server;
        await secondary_server;
      }
      server_check_f();
      }
  //////////////////////////////////////////////<Main_Logic_End>///////////////////////////////////////////////
        ////////////////////////////////////// <Main Handler> //////////////////////////////
         // Servers are down!
      if(Primary_up_Secondary_up_again){  // Secondary Down & Primary up => Secondary back on & Primary up (With module)
        console.log(Secondary + ' is back on with modules:  ' + target_end_point + '  ' + hours + ':' + minutes + ':' + seconds);
        if(Primary_Module_Down){
          chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Secondary + kma_mon_end_point});
          chrome.windows.update(windowid, {focused: true});
        }
        Secondary_module_up_again = false;
        Primary_up_Secondary_up_again = false;
      }else if(Secondary_up_Primary_up_again){ // Primary Down & Secondary up => Primary back on & Secondary up (With module)
        console.log(Primary + ' is back on with modules:  ' + target_end_point + '  ' + hours + ':' + minutes + ':' + seconds);
        if(Secondary_Module_Down){
          chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Primary + kma_mon_end_point});
          chrome.windows.update(windowid, {focused: true});
        }
        Primary_module_up_again = false;
        Secondary_up_Primary_up_again = false;
      }else if(Primary_Down & Primary_Log == false & Primary_up_again == false & Secondary_Module_Down == false & Servers_Are_Down == false){ // current monitoring web = Primary // Primary Down => monitor Secondary
          if (currenturl.includes(Primary) & Primary_Down == true & Secondary_Down == false) {
              chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Secondary + kma_mon_end_point});
              chrome.windows.update(windowid, {focused: true});
              playMP3('Server47_To_Server48.mp3'); // Server 47 to 48 
            }
            Primary_Log = true;
      }else if(Secondary_Down & Secondary_Log == false & Secondary_up_again == false & Primary_Module_Down == false  & Servers_Are_Down == false){ // current monitoring web = Secondary // Secondary Down => monitor Primary
          if (currenturl.includes(Secondary) & Secondary_Down == true & Primary_Down == false) {
              chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Primary + kma_mon_end_point});
              chrome.windows.update(windowid, {focused: true});
              playMP3('Server48_To_Server47.mp3'); // Server 48 to 47
            }
            Secondary_Log = true;    
      }else if(Primary_Module_Down & Primary_Module_Log == false & Primary_module_up_again == false & Primary_Down == false & Modules_Are_Down == false){ // current monitoring web = Primary // Primary module Down => monitor Secondary
        if(Primary_Module_Log == false){
              console.log(Primary + "   [Response: " + Primary_Response + "] on " + target_end_point);
              console.log(Primary + ' is on but ' + target_end_point + ' is not responding (Module Down) ' + hours + ':' + minutes + ':' + seconds);
              if((currenturl.includes(Primary)& Secondary_Down == false) & (Secondary_Module_Down == false & Primary_Module_Log == false)) {
                  chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Secondary + kma_mon_end_point});
                  chrome.windows.update(windowid, {focused: true});
                  playMP3('Server47_To_Server48.mp3'); // Server 47 to 48 
              }}
          Primary_Module_Log = true;
      }else if(Secondary_Module_Down & Secondary_Module_Log == false & Secondary_module_up_again == false & Secondary_Down == false & Modules_Are_Down == false){ // current monitoring web = Secondary // Secondary module Down => monitor Primary
          if(Secondary_Module_Log == false){
              console.log(Secondary + "   [Response: " + Secondary_Response + "] on " + target_end_point);
              console.log(Secondary + ' is on but ' + target_end_point + ' is not responding (Module Down) ' + hours + ':' + minutes + ':' + seconds);
              if ((currenturl.includes(Secondary) & Primary_Down == false) || (currenturl.includes(Secondary) & Secondary_Module_Log == false)) {
              chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Primary + kma_mon_end_point});
              chrome.windows.update(windowid, {focused: true});
              playMP3('Server48_To_Server47.mp3'); // Server 48 to 47
              }}
          Secondary_Module_Log = true;
      }else if(Primary_up_again & Primary_up_again_log == false & Primary_module_up_again==false & Secondary_module_up_again==false & Servers_are_up_again == false & Modules_Are_Down == false & Servers_Are_Down == false){ // Primary up again without modules, if Secondary down, load Primary with no modules on a web
          console.log(Primary + "   [Response: " + Primary_Response + "] on " + target_end_point);
          console.log(Primary + ' is on but ' + target_end_point + ' is not responding (Module Down)' + hours + ':' + minutes + ':' + seconds);
        if (Secondary_Down == true) {
          chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Primary + kma_mon_end_point});
          chrome.windows.update(windowid, {focused: true});
        }
          Primary_up_again = false;
          Primary_up_again_log = true;
      }else if(Secondary_up_again & Secondary_up_again_log == false & Primary_module_up_again==false & Secondary_module_up_again==false & Servers_are_up_again == false & Modules_Are_Down == false & Servers_Are_Down == false){ // Secondary up without modules, if Primary down, load Secondary with no modules on a web
          console.log(Secondary + "   [Response: " + Secondary_Response + "] on " + target_end_point);
          console.log(Secondary + ' is on but ' + target_end_point + ' is not responding (Module Down)' + hours + ':' + minutes + ':' + seconds);
          if (Primary_Down == true) {
            chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Secondary + kma_mon_end_point});
            chrome.windows.update(windowid, {focused: true});
          }
          Secondary_up_again = false;
          Secondary_up_again_log = true;
      }else if (Primary_module_up_again){ // Primary module is back on, if current monitoring tab is Primary and Secondary down then reload
          console.log(Primary + ' is back on with modules:  ' + target_end_point + '  ' + hours + ':' + minutes + ':' + seconds);
          if((currenturl.includes(Primary) & (Secondary_Down|Secondary_Module_Down)) | (currenturl.includes(Secondary) & (Secondary_Module_Down | Secondary_Down))){
            chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Primary + kma_mon_end_point});
            chrome.windows.update(windowid, {focused: true});
            playMP3('47_restore_up.mp3');
          }
          Primary_module_up_again = false;
          Primary_up_again = false;
      }else if (Secondary_module_up_again){ // Secondary module is back on, if current monitoring tab is Secondary and Primary down then reload
          console.log(Secondary + ' is back on with modules:  ' + target_end_point + '  '  + hours + ':' + minutes + ':' + seconds);
          if((currenturl.includes(Secondary) & (Primary_Down|Primary_Module_Down)) | (currenturl.includes(Primary) & (Primary_Module_Down | Primary_Down))){
            chrome.tabs.update(lasttabUsed, {highlighted: true, active: true, url: http_https + Secondary + kma_mon_end_point });
            chrome.windows.update(windowid, {focused: true});
            playMP3('48_restore_up.mp3');
          }
          Secondary_module_up_again = false;
          Secondary_up_again = false;
      }else if(Servers_are_up_again&Servers_are_up_again_log==false){ // leave log : Servers are back on. //need fix
        console.log('Servers are ON (Without Modules)   ' + hours + ':' + minutes + ':' + seconds);
        Servers_are_up_again = false;
        Servers_are_up_again_log = true;
      }else if(Modules_Are_Up_Again){  // leave log : Modules are back on.
          console.log('Servers are back on (With Modules)   ' + hours + ':' + minutes + ':' + seconds);
          Modules_Are_Up_Again = false;
      }
    if(Modules_Are_Down & Modules_Are_Down_Log == false){ // Modules are Down!
            if(Servers_Are_Down){
              //none
            }else{
              console.log('Servers\'_Modules are Down   '+ hours + ':' + minutes + ':' + seconds);
              playMP3('Server47_48_Down.mp3_module');
              Modules_Are_Down_Log = true;
              Primary_Module_Log = true;
              Secondary_Module_Log = true;
            }
    }
    if(Servers_Are_Down & Servers_Are_Down_Log == false){ // Servers are Down!
      console.log('Servers are Down   '+ hours + ':' + minutes + ':' + seconds);
      playMP3('Server47_48_Down.mp3');
      Servers_Are_Down_Log =true;
      Primary_Log = true;
      Secondary_Log = true;
  }}
//////////////////////////////////////////////////////////////////<Main handler end>/////////////////////////////////////////////////////////////////////////
  }
  }catch(err){
    console.log(err + '   ' + hours +':'+ minutes +':'+ seconds + err);
    mon_started = false; // ERROR => redo tab search
  }
},1000);