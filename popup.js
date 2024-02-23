// Created on 2024.01.31 (USER INTERFACE)_by LEE JUNSUNG
setInterval(() => {

try{
    chrome.runtime.sendMessage({ // Popup to Back
        message: "signal"
    });
}catch(err){
    console.log("error encounter, sending 'signal' to Background: " + err);
}

},1000);
chrome.runtime.onMessage.addListener(function (request) {
    try{
        const statusColor = request.signal ? 'green' : 'red';
        //const statusText = request.siganl ? 'OFF' : 'ON';
        const statusColor_PS = request.PSD ? 'red' : 'green';
        const statusColor_SS = request.SSD ? 'red' : 'green';
        const statusColor_PM = request.PMD ? 'red' : 'green';
        const statusColor_SM = request.SMD ? 'red' : 'green';
        const lasttabUsed = request.last_tab;
        const windowid = request.window_id;
        if(request.signal == false){
            document.body.innerHTML = `<!DOCTYPE html>
            <html>
            <title>STATUS</title>
            <img src="kma.png" alt="KMA" width="236" height="180">
            <h1 style="font-size: 30px; color:${statusColor};">STATUS: OFF</font></h1>
            </body></html>`;
        }else if(request.signal == true){
            document.body.innerHTML = `<!DOCTYPE html><html><title>STATUS</title>
            <img src="kma.png" alt="KMA" width="236" height="180">
            <h1 style="font-size: 30px; color:${statusColor};">STATUS: ON</font></h1>
            <p style="font-size:200%; color:${statusColor_PS}" >PSD: ${request.PSD}</p> 
            <p style="font-size:200%; color:${statusColor_SS}" >SSD: ${request.SSD}</p> 
            <p>=============================</p>
            <p style="font-size:200%; color:${statusColor_PM}" >PMD: ${request.PMD}</p>
            <p style="font-size:200%; color:${statusColor_SM}" >SMD: ${request.SMD}</p>
            <button id="find_tab" style="font-size: 30px; width: 230px; height: 45px;">Find_TAB</button>
            </body></html>`;
            document.getElementById('find_tab').addEventListener('click', () => {
                chrome.windows.update(windowid, {focused: true});
                chrome.tabs.update(lasttabUsed, {highlighted: true, active: true});
            });
        }
    }catch(err){
        console.log("error on (popup.js): " + err);
    }
});