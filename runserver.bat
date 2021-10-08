@echo off
set ip_address_string="IPv4 Address"
rem Uncomment the following line when using older versions of Windows without IPv6 support (by removing "rem")
rem set ip_address_string="IP Address"
echo Network Connection Test
for /f "usebackq tokens=2 delims=:" %%f in (`ipconfig ^| findstr /c:%ip_address_string%`) do set NetworkIP=%%f
ping %NetworkIP%
echo Starting server port and ipv4 connection to router...
node servermain.js
