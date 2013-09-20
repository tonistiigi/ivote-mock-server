This is a simple mock server written in Node.js for testing the Android vote verification application used in Estonian national elections published in here [vvk-ehk/ivotingverification](https://github.com/vvk-ehk/ivotingverification)

Tested with OSX 10.8

## Building

```
git clone git://github.com/tonistiigi/ivote-mock-server.git
cd ivote-mock-server
npm install
```

### Domain setup

For the SSL to work you have to access the server with the same domain that is written into the certificate. By default first local LAN IP is used.

Check by running `node domain.js`. If you can't access this IP from your android device or have a key for specific domain run `node domain.js --set <new-domain-or-ip>`.


### Generating keys

```
APP_PATH=path/to/the/android/project make
```

Will generate all the keys and deploy the config URL + trust store to the android project directory. If you want to use some of your own keys then just put them in this directory before running `make`.

### Running

```
sudo node server.js
```

Root privileges are needed for binding to the port 443. If you are not root then port 4433 is used and you have to manually point the Android app to that port.


-----

_Just to avoid any confusion: I'm not affiliated with VVK in any way and do not work for any company making software for VVK._
