'use strict';
var utils =    require(__dirname + '/lib/utils');
var adapter = new utils.Adapter('yeelight');
const YeelightSearch = require('yeelight-wifi');
var yeelight;

adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');

        callback();
    } catch (e) {
        callback();
    }
});


adapter.on('objectChange', function (id, obj) {
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});
adapter.on('stateChange', function (id, state) {
    if (state && !state.ack) {
        var ids = id.split(".");
        var val = state.val;
        var light_id = ids[2].substring(ids[2].indexOf("_") + 1);
        var cmd = ids[ids.length - 1].toString().toLowerCase();
        const light = yeelight.getYeelightById(light_id);
        adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state) + ', {light: ' + light + '}');
        if(light){
            if(cmd === 'power'){
                if (val === true){
                    light.turnOn().then(() => {
                        adapter.log.debug("toggled");
                    })
                        .catch(err => {
                            adapter.log.debug(`received some error: ${err}`);
                        });
                } else {
                    light.turnOff();
                }
            }
            if(cmd === 'name'){ //setName(name: string)
                light.setName(val);
            }
            if(cmd === 'bright'){ //setBrightness(brightness: string, effect: string, time: number):
                light.setBrightness(val);
            }
            if(cmd === 'ct'){ //setColorTemperature(temperature: string, effect: string, time: number)
                light.setColorTemperature(val);
            }
            if(cmd === 'rgb'){ //setRGB(hex: string, effect: string, time: number)
                if(val){
                    light.setRGB(val);
                }
            }
            if(cmd === 'hue'){ //setHSV(hue: string, saturation: string, effect: string, time: number)
                adapter.getState(id.slice(0, -4) + '.sat', function (err, state) {
                    if (err) {
                        adapter.log.error(err);
                    } else {
                        if (state) {
                            light.setHSV(val.toString(), state.val);
                        }
                    }
                });
            }
            if(cmd === 'sat'){ //setHSV(hue: string, saturation: string, effect: string, time: number)
                adapter.getState(id.slice(0, -4) + '.hue', function (err, state) {
                    if (err) {
                        adapter.log.error(err);
                    } else {
                        if (state) {
                            light.setHSV((state.val).toString(), val);
                        }
                    }
                });
            }
            if(cmd === 'addcron'){ //addCron (type: string , value: string ) addCron (  );
                var vals = val.split(",");
                if(vals[1] > 0){
                    light.addCron(vals[0], vals[1]);
                } else {
                    light.deleteCron(0);
                }
            }
            if(cmd === 'delayoff'){ //addCron (type: string , value: string ) addCron (  );
                if(val > 0){
                    light.addCron(0, val);
                } else {
                    light.deleteCron(0);
                }
            }
            if(cmd === 'music_on'){ //setMusicMode(action: number, host: string, port: string) setMusicMode(0, '10.0.0.1', 4000);
                adapter.getState(id.slice(0, -9) + '.music_url', function (err, state) {
                    if (err) {
                        adapter.log.error(err);
                    } else {
                        if (state) {
                            var url = state.val.split(":");
                            if(val){
                                light.setMusicMode(1, url[0], parseInt(url[1]), 10);
                            } else {
                                light.setMusicMode(0);
                            }
                        }
                    }
                });
            }
            if(cmd === 'flowing'){ //startColorFlow(count: number, action: string, flowExpression: string)
                adapter.getState(id.slice(0, -8) + '.flow_params', function (err, state) {
                    if (err) {
                        adapter.log.error(err);
                    } else {
                        if (state) {
                            if(val){
                                var params = state.val.split(",");
                                state.val = params.slice(2);
                                light.startColorFlow(params[0], params[1], state.val.toString());
                            } else {
                                light.stopColorFlow();
                            }
                        }
                    }
                });
            }
            if(cmd === 'flow_params'){ //startColorFlow(count: number, action: string, flowExpression: string)
                if(val){
                    var params = val.split(",");
                    val = params.slice(2);
                    light.startColorFlow(params[0], params[1], val.toString());
                } else {
                    light.stopColorFlow();
                }
            }
            //TODO setDefaultState() setDefaultState():
        } else {
            id = id.substr(0, id.lastIndexOf('.')+1);
            adapter.setState(id + 'info.connection', false, true);
            adapter.log.error('Light id:' + light_id + ' not connected!');
            yeelight.refresh();
        }
    }
});
adapter.on('message', function (obj) {
    adapter.log.error('message' + JSON.stringify(obj));
    if (typeof obj === 'object' && obj.message) {
        if (obj.command === 'discovery') {
        }
    }
});

adapter.on('ready', function () {
    main();
});

var OBJ = {
    'connection': {common: {name: 'connected to bulb',                    role: 'indicator.connected', write: false, read: true, type: 'boolean'},                      type: 'state',  native: {} },
    'ip':          {common: {name: 'IP adress light',                     role: 'state',               write: false, read: true, type: 'string' },                      type: 'state',  native: {} },
    'port':        {common: {name: 'port',                                role: 'state',               write: false, read: true, type: 'number' },                      type: 'state',  native: {} },
    'id':          {common: {name: 'ID',                                  role: 'state',               write: false, read: true, type: 'string' },                      type: 'state',  native: {} },
    'power':       {common: {name: 'Power',                               role: 'state',               write: true,  read: true, type: 'boolean' },                     type: 'state',  native: {} },
    'bright':      {common: {name: 'Brightness percentage',               role: 'level',               write: true,  read: true, type: 'number', min: 0,    max: 100},  type: 'state',  native: { } },
    'rgb':         {common: {name: 'RGB',                                 role: 'state',               write: true,  read: true, type: 'string' },                      type: 'state',  native: {} },
    'color_mode':  {common: {name: 'Color_mode',                          role: 'state',               write: false, read: true, type: 'number', states: '1:rgb mode;2:color temperature mode;3:hsv mode'},  type: 'state',  native: {} },
    'hue':         {common: {name: 'HUE',                                 role: 'level',               write: true,  read: true, type: 'number', min: 0,    max: 359 }, type: 'state',  native: {} },
    'sat':         {common: {name: 'Saturation',                          role: 'level',               write: true,  read: true, type: 'number', min: 0,    max: 100 }, type: 'state',  native: {} },
    'ct':          {common: {name: 'Color temperature',                   role: 'state',               write: true,  read: true, type: 'number', min: 1700, max: 6500}, type: 'state',  native: {} },
    'flowing':     {common: {name: 'Color flow is running',               role: 'state',               write: true,  read: true, type: 'boolean' },                     type: 'state',  native: {} },
    'delayoff':    {common: {name: 'The remaining time of a sleep timer', role: 'state',               write: true,  read: true, type: 'number' , min: 0, max: 60},     type: 'state',  native: {} },
    'flow_params': {common: {name: 'Current flow parameters',             role: 'state',               write: true,  read: true, type: 'string' },                      type: 'state',  native: {} },
    'music_on':    {common: {name: 'Music mode is on',                    role: 'state',               write: true,  read: true, type: 'boolean' },                     type: 'state',  native: {} },
    'music_url':   {common: {name: 'URL for music mode',                  role: 'state',               write: true,  read: true, type: 'string' },                      type: 'state',  native: {} },
    'name':        {common: {name: 'Name',                                role: 'state',               write: true,  read: true, type: 'string' },                      type: 'state',  native: {} },
    'addCron':     {common: {name: 'Start a timer job on the smart LED',  role: 'state',               write: true,  read: true, type: 'string' },                      type: 'state',  native: {} }
};

function main() {
    adapter.log.info('yeelight starting...');
    adapter.subscribeStates('*');

    yeelight = new YeelightSearch();
    setInterval(function(){yeelight.refresh();}, 10000);

    process.on('unhandledRejection', error => {
        adapter.log.error('--- unhandledRejection', error);
    });

    yeelight.on('found', function(bulb){
        adapter.log.debug('Light found: {' + bulb.hostname + ':' + bulb.port + '}');
        adapter.log.debug('Founding Light{ id: ' + bulb.getId() + ', name: ' + bulb.name + ', model: ' + bulb.model + ', supports: ' + bulb.supports + '}');
        
        bulb.socket.on("connected", function(){
            adapter.log.debug('socket connected');
        });
        
        bulb.on("error", function(id, ex, err){
            adapter.log.error('Error socket yeelight id: ' + id + ': ' + ex + ': ' + err);
            adapter.setState(bulb.model + '_' + id + '.info.connection', false, true);
        });

        bulb.on("connected", function(){
            adapter.log.debug('yeelight connected: ' + bulb.hostname + ':' + bulb.port + '/ id: ' + bulb.id);
            setinfoStates(bulb, function (){
                bulb.getValues(
                    "power",
                    "bright",
                    "rgb",
                    "color_mode",
                    "hue",
                    "sat",
                    "ct",
                    "flowing",
                    "delayoff",
                    "flow_params",
                    "music_on"
                );
            });
        });

        bulb.on("notifcation", json => {
            if (json.method == "props" && json.params) {
                for (var property in json.params) {
                    if (json.params.hasOwnProperty(property)) {
                        var val = json.params[property];
                        adapter.log.debug('Response props from {id: ' + bulb.getId() + ', ' + property + ': ' + val + '}');
                        bulb[property] = val;
                        if(
                            val === 'on' ||
                            val === 'off' ||
                            property === 'flowing'||
                            property === 'music_on'
                        ){
                            val = toBool(val);
                        }
                        if(property === 'rgb'){
                            val = dec2hex(val);
                        }

                        var sid = bulb.model + '_' + bulb.getId();
                        setconnected(bulb);
                        adapter.setState(sid + '.' + property , val, true );
                    }
                }
            }
        });

        bulb.on("response", (id, result) => {
            adapter.log.debug('Response - {id: ' + id + ', result:[' + result + ']}');
            if(result && result[0] !== 'ok'){
                var model = bulb.model;
                //result:[on,100,,2,,,,0,0,,] for mono
                bulb["power"] = result[0];
                bulb["bright"] = result[1];
                bulb["rgb"] = result[2];
                bulb["color_mode"] = result[3];
                bulb["hue"] = result[4];
                bulb["sat"] = result[5];
                bulb["ct"] = result[6];
                bulb["flowing"] = result[7];
                bulb["delayoff"] = result[8];
                bulb["flow_params"] = result[9];
                bulb["music_on"] = result[10];

                var sid = bulb.model + '_' + bulb.getId();
                var support = bulb.supports.toString();
                adapter.setObjectNotExists(sid + '.power', OBJ.power );
                adapter.setObjectNotExists(sid + '.bright', OBJ.bright );
                adapter.setObjectNotExists(sid + '.color_mode', OBJ.color_mode );
                adapter.setObjectNotExists(sid + '.flowing', OBJ.flowing );
                adapter.setObjectNotExists(sid + '.delayoff', OBJ.delayoff );
                adapter.setObjectNotExists(sid + '.flow_params', OBJ.flow_params );
                adapter.setObjectNotExists(sid + '.addCron', OBJ.addCron );
                if (~support.indexOf('adjust_ct')){
                    adapter.setObjectNotExists(sid + '.ct', OBJ.ct );
                    adapter.setState(sid + '.ct', bulb.ct, true );
                }
                if (~support.indexOf('set_music')){
                    adapter.setObjectNotExists(sid + '.music_on',  OBJ.music_on );
                    adapter.setObjectNotExists(sid + '.music_url', OBJ.music_url );
                    adapter.setState(sid + '.music_on', toBool(bulb.music_on), true );
                    adapter.setState(sid + '.music_url', '', true );
                }
                if(model === 'color'){
                    adapter.setObjectNotExists(sid + '.hue', OBJ.hue );
                    adapter.setObjectNotExists(sid + '.sat', OBJ.sat );
                    adapter.setObjectNotExists(sid + '.rgb', OBJ.rgb );
                    adapter.setState(sid + '.hue', bulb.hue, true );
                    adapter.setState(sid + '.sat', bulb.sat, true );
                    adapter.setState(sid + '.rgb', dec2hex(bulb.rgb), true );
                }
                adapter.setState(sid + '.power', toBool(bulb.power), true );
                adapter.setState(sid + '.bright', bulb.bright, true );
                adapter.setState(sid + '.color_mode', bulb.color_mode, true );
                adapter.setState(sid + '.flowing', toBool(bulb.flowing), true );
                adapter.setState(sid + '.delayoff', bulb.delayoff, true );
                adapter.setState(sid + '.flow_params', bulb.flow_params, true );
                /*
                 0 = "get_prop"
                 1 = "set_default"
                 2 = "set_power"
                 3 = "toggle"
                 4 = "set_bright"
                 5 = "start_cf"
                 6 = "stop_cf"
                 7 = "set_scene"
                 8 = "cron_add"
                 9 = "cron_get"
                 10 = "cron_del"
                 11 = "set_ct_abx"
                 12 = "set_rgb"
                 13 = "set_hsv"
                 14 = "set_adjust"
                 15 = "adjust_bright"
                 16 = "adjust_ct"
                 17 = "adjust_color"
                 18 = "set_music"
                 19 = "set"
                 */
            }
        });
    });
}

function setconnected(bulb){
    if(bulb){
        var sid = bulb.model + '_' + bulb.getId();
        adapter.getState(
            sid + '.info.connection', function (err, state){
                if (err){
                    adapter.log.debug('getState info.connection err: ' + err);
                } else {
                    if (!state.val){
                        adapter.setState(sid + '.info.connection', true, true);
                    }
                }
            });
    }
}

function toBool(val){
    if(val === 'on' || val === 'true' || val == true || val === 1 || val === '1'){
        val =  true;
    } else {
        val = false;
    }
    return val;
}

function dec2hex(dec) {
    return '#' + (+dec).toString(16);
}
function hex2dec(hex) {
    return parseInt(hex.substring(1), 16);
}

function setinfoStates(bulb, cb){
    var sid = bulb.model + '_' + bulb.getId();
    adapter.setObjectNotExists(sid, {
        type: 'channel',
        common: {
            name: bulb.model,
            icon: '/icons/' + bulb.model + '.png'
        },
        native: {
            sid: bulb.id,
            type: bulb.model
        }
    });
    adapter.setObjectNotExists(sid + '.info.connection', OBJ.connection );
    adapter.setObjectNotExists(sid + '.info.ip', OBJ.ip );
    adapter.setObjectNotExists(sid + '.info.port', OBJ.port);
    adapter.setObjectNotExists(sid + '.info.id', OBJ.id);
    adapter.setObjectNotExists(sid + '.name', OBJ.name);
    adapter.setState(sid + '.info.ip', bulb.hostname, true);
    adapter.setState(sid + '.info.port', bulb.port, true);
    adapter.setState(sid + '.info.id', bulb.id, true);
    adapter.setState(sid + '.name', bulb.name, true);
    setconnected(bulb);
    if(cb) cb();
}