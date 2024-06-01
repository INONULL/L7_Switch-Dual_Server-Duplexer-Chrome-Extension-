# L7_Switch-Dual_Server-Duplexer (Chrome Extension) 
# <Change Variables and Files for your needs>

# How To Set
- Open background.js  <br />
- from line 16-19  <br />
# Define values with your own: Primary, Secondary, kma_mon_end_point, target_end_point
- Primary = (Primary IP or url) <= change it with your value <br />
- Secondary = (Secondary IP or url) <= change it with your value <br />
- kma_mon_end_point = (the redirect IP or url target's endpoint) <= change it with your value  <br />
- target_end_point = (the monitoring target element) <= change it with your value

# Things to change with your files
'kma.png', 'monitor.png' and '*.mp3's and other things you might want to modify

# How it Works
- When it detects target url on tab, it starts to monitor both servers
- If server1 down -> Redirect -> server2
- If server2 down -> Redirect -> server1
- If Both Servers or Modules are Down (Alert will popup) <- goes off when one of them back on
- If server1 or 2 Down and User connects to one that is down -> force redirect to the alive server
- If User out of the url or IP -> [Extension (Standby)]
- If User has opened multiple 'target IP or url's and not knowing which tab is being monitored, click Extesnion Icon and use 'Find_TAB'
# How to install <br />
- Developer mode -> ON  [Top right Corner]
- Click Load unpacked
- GOTO the source folder, then click 'Ok'
![alt text](https://github.com/INONULL/L7_Switch-Dual_Server-Duplexer-Chrome-Extension-/blob/main/How_It_Works_Images/How_To_Install.png?raw=true) <br />


# Images

# Extension-Popup-Not-On <br />
![alt text](https://github.com/INONULL/L7_Switch-Dual_Server-Duplexer-Chrome-Extension-/blob/main/How_It_Works_Images/Extension_Popup_not_active.png?raw=true) <br />
# Extension-Popup-On <br />
![alt text](https://github.com/INONULL/L7_Switch-Dual_Server-Duplexer-Chrome-Extension-/blob/main/How_It_Works_Images/Extension_Popup_active.png?raw=true) <br />
# Server1 is Down -> Switches to Server2 <br />
![alt text](https://github.com/INONULL/L7_Switch-Dual_Server-Duplexer-Chrome-Extension-/blob/main/How_It_Works_Images/Server1_Down_Switched_To_Server2.png?raw=true) <br />
# Modules are down! <br />
![alt text](https://github.com/INONULL/L7_Switch-Dual_Server-Duplexer-Chrome-Extension-/blob/main/How_It_Works_Images/Modules_Down.png?raw=true) <br />
# Servers are down! <br />
![alt text](https://github.com/INONULL/L7_Switch-Dual_Server-Duplexer-Chrome-Extension-/blob/main/How_It_Works_Images/Servers_Down.png?raw=true) <br />
# Devtools log <br />
![alt text](https://github.com/INONULL/L7_Switch-Dual_Server-Duplexer-Chrome-Extension-/blob/main/How_It_Works_Images/Log_Example.png?raw=true)
