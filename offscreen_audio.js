//2024.01.29 Lee JunSung
var audio = null;
var popup = null;
chrome.runtime.onMessage.addListener(msg => { // Background to Audio 
    try{
        if(('play' in msg)){
            if(audio!=null){
                audio.pause();
            }
            playMP3(msg.play);
        }
    }catch(err){
        console.log("error on (offscreen_audio_onMessage_addListener): " + err)
    }
});

function playMP3({ source, volume }) {
    try{
        if (source == 'Server47_48_Down.mp3'){
            if((popup!=null)){
                // --> IF(SERVERS_DOWN) THEN GET POPUPID, IF ONE SERVER UP, AUTOMATICALLY CLOSE THE 'SERVERS DOWN WARNING' <--
                if(!popup.closed){
                    popup.document.body.innerHTML = `<!DOCTYPE html><html><title>Servers Are Down!!</title>
                    <h1 style="font-size: 35px; color:red;">Servers Are Down!</font></h1>
                    <br><button id="stopButton" style="font-size: 35px; width: 325px; height: 100px;">STOP_ALERT!</button>
                    <body><p style="font-size:140%;"><br>Click "STOP_ALERT!" or Close this window<br>To Stop Alert!!</p></body></html>`;
                    popup.document.body.style.backgroundColor = "#eeffff";
                    popup.focus();
                    popup.document.getElementById('stopButton').addEventListener('click', () => {
                        audio.pause();
                        popup.close();
                    });
                }
            }
            audio = new Audio(source);
            audio.load();
            audio.volume = volume;
            audio.loop = true;
            audio.play();
        popup = window.open('', 'popup', 'width=350,height=350, resizable=no');
        popup.resizeTo(350, 350);
        popup.addEventListener('resize', function() { //force 350 350
            popup.resizeTo(350, 350);
        });
        popup.document.body.innerHTML = `<!DOCTYPE html><html><title>Servers Are Down!!</title>
        <h1 style="font-size: 35px; color:red;">Servers Are Down!</font></h1>
        <br><button id="stopButton" style="font-size: 35px; width: 325px; height: 100px;">STOP_ALERT!</button>
        <body><p style="font-size:140%;"><br>Click "STOP_ALERT!" or Close this window<br>To Stop Alert!!</p></body></html>`;
        popup.document.body.style.backgroundColor = "#eeffff";
        popup.focus();
        popup.document.getElementById('stopButton').addEventListener('click', () => {
            audio.pause();
            popup.close();
        });
        }
        if(source == 'Server47_48_Down.mp3_module'){
            if((popup!=null)){
                // --> IF(SERVERS_DOWN) THEN GET POPUPID, IF ONE SERVER UP, AUTOMATICALLY CLOSE THE 'SERVERS DOWN WARNING' <--
                if(!popup.closed){
                    popup.document.body.innerHTML = `<!DOCTYPE html><html><title>Modules Are Down!!</title>
                    <h1 style="font-size: 32px; color:red;">Modules Are Down!</font></h1>
                    <br><button id="stopButton" style="font-size: 35px; width: 325px; height: 100px;">STOP_ALERT!</button>
                    <body><p style="font-size:140%;"><br>Click "STOP_ALERT!" or Close this window<br>To Stop Alert!!</p></body></html>`;
                    popup.document.body.style.backgroundColor = "#eeffff";
                    popup.focus();
                    popup.document.getElementById('stopButton').addEventListener('click', () => {
                        audio.pause();
                        popup.close();
                    });
                }
            }
            audio = new Audio('Server47_48_Down.mp3');
            audio.load();
            audio.volume = volume;
            audio.loop = true;
            audio.play();
            popup = window.open('', 'popup', 'width=350,height=350, resizable=no');
            popup.resizeTo(350, 350);
            popup.addEventListener('resize', function() { //force 350 350
                popup.resizeTo(350, 350);
            });
            popup.document.body.innerHTML = `<!DOCTYPE html><html><title>Modules Are Down!!</title>
            <h1 style="font-size: 32px; color:red;">Modules Are Down!</font></h1>
            <br><button id="stopButton" style="font-size: 35px; width: 325px; height: 100px;">STOP_ALERT!</button>
            <body><p style="font-size:140%;"><br>Click "STOP_ALERT!" or Close this window<br>To Stop Alert!!</p></body></html>`;
            popup.document.body.style.backgroundColor = "#eeffff";
            popup.focus();
            popup.document.getElementById('stopButton').addEventListener('click', () => {
                audio.pause();
                popup.close();
            });
        }
        if(source != 'Server47_48_Down.mp3_module' & source != 'Server47_48_Down.mp3'){
            if((popup!=null)){
                if(!popup.closed){
                    popup.close();
                    popup = null;
                }
            }
            audio = new Audio(source);
            audio.load();
            audio.volume = volume;
            audio.play();
        }

        popup.onbeforeunload = () => {
            audio.pause();
        };

    }catch(err){
        console.log("error on (offscreen_audio_playMP3): " + err);
        popup = null;
    }

}
setInterval(async () => {
    (await navigator.serviceWorker.ready).active.postMessage('keepAlive');
  }, 20e3);