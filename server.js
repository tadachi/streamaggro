var express         = require('express');
var router          = express.Router();
var vhost           = require('vhost');
var app             = require('express.io')();
var favicon         = require('serve-favicon');
var port            = parseInt(process.env.PORT, 10) || 4001;

var Client          = require('node-rest-client').Client;

// Simple timestamp function. Invoke with timestamp();
htimestamp = function() {
    var date = new Date();
    result = '[' + date.getFullYear() + '/' + date.getMonth() + '/' +
        date.getDate() + '/' + date.getHours() + ':' +
        date.getMinutes() + ':' + date.getSeconds() + ']';
    return result;
}

/*
 * Similar to what you find in Java's format.
 * Usage: chatsrc = 'http://twitch.tv/chat/embed?channel={channel}&amp;popout_chat=true'.format({ channel: 'cosmo'});
 * Output: http://twitch.tv/chat/embed?channel=cosmo&amp;popout_chat=true
 */
if (!String.prototype.format) {
    String.prototype.format = function() {
        var str = this.toString();
        if (!arguments.length)
            return str;
        var args = typeof arguments[0],
            args = (('string' == args || 'number' == args) ? arguments : arguments[0]);
        for (arg in args)
            str = str.replace(RegExp('\\{' + arg + '\\}', 'gi'), args[arg]);
        return str;
    }
}

app.http().io();

app.use(favicon(__dirname + '/favicon.ico'));

app.listen(port);

var hostname = 'localhost'; // Dev.
//var hostname = 'api.takbytes.com'; // Prod.

// REST CLIENT ---------------------------------------
function RestClient() {
    this.client = new Client();
    this.data_store = {
                        starcraft: null,
                        speedruns: null,
                        dota: null,
                        hitbox: null,
                        hearthstone: null,
                        counterstrike: null,
                        azubu: null,
						leagueoflegends: null,
                        heroes: null
                    };
    // console.log(this.data_store);
}

RestClient.prototype.update = function(self) {
    var self = this;
    this.getDotaInfo(self, 60, function(results) {
        self.data_store.dota = results;
        console.log(htimestamp() + ' dota cached.');
    });
    this.getStarcraftInfo(self, 60, function(results) {
        self.data_store.starcraft = results;
        console.log(htimestamp() + ' starcraft cached.');
    });
    this.getHearthstoneInfo(self, 60, function(results) {
        self.data_store.hearthstone = results;
        console.log(htimestamp() + ' hearthstone cached.');
    });
    this.getCounterstrikeInfo(self, 60, function(results) {
        self.data_store.counterstrike = results;
        console.log(htimestamp() + ' counterstrike cached.');
    });
    this.getSpeedrunsInfo(self, function(results) {
        self.data_store.speedruns = results;
        console.log(htimestamp() + ' speedruns cached.');
    });
    this.getHitboxInfo(self, function(results) {
        self.data_store.hitbox = results;
        console.log(htimestamp() + ' hitbox cached.');
    });
    this.getAzubuInfo(self, function(results) {
        self.data_store.azubu = results;
        console.log(htimestamp() + ' azubu cached.');
    });
	this.getLeagueOfLegendsInfo(self, 60, function(results) {
        self.data_store.leagueoflegends = results;
        console.log(htimestamp() + ' leagueoflegends cached.');
    });
    this.getHeroesInfo(self, 60, function(results) {
        self.data_store.heroes = results;
        console.log(htimestamp() + ' heroesofthestorm cached.');
    });

}

/***
 * Similar to what you find in Java's format.
 * Usage: chatsrc = 'http://twitch.tv/chat/embed?channel={channel}&amp;popout_chat=true'.format({ channel: 'cosmo'});
 * Output: http://twitch.tv/chat/embed?channel=cosmo&amp;popout_chat=true
 ***/
RestClient.prototype.getDotaInfo = function(self, limit, callback) {
    //console.log('https://api.twitch.tv/kraken/search/streams?q=dota&limit={lim}'.format({lim: limit}))
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=dota&limit={lim}'.format({lim: limit}), function(data, response){ // bandwidth-class: heavy, game: dota, sorted-by-most-viewers
        callback(data);
    }).on('error',function(err){
        console.log('something went wrong with the request', err.request.options);
    });
}
RestClient.prototype.getStarcraftInfo = function(self, limit, callback) {
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=starcraft&limit={lim}'.format({lim: limit}), function(data, response){ // bandwidth-class: heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    }).on('error',function(err){
        console.log('something went wrong with the request', err.request.options);
    });
};
RestClient.prototype.getHearthstoneInfo = function(self, limit, callback) {
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=hearthstone&limit={lim}'.format({lim: limit}), function(data, response){ // bandwidth-class: heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    }).on('error',function(err){
        console.log('something went wrong with the request', err.request.options);
    });
};
RestClient.prototype.getCounterstrikeInfo = function(self, limit, callback) {
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=counter-strike&limit={lim}'.format({lim: limit}), function(data, response){ // bandwidth-class: heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    }).on('error',function(err){
        console.log('something went wrong with the request', err.request.options);
    });
};
RestClient.prototype.getSpeedrunsInfo = function (self, callback) {
    this.client.get('http://api.speedrunslive.com/frontend/streams', function(data, response){ // bandwidth-class: very-heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    }).on('error',function(err){
        console.log('something went wrong with the request', err.request.options);
    });
};
RestClient.prototype.getHitboxInfo = function (self, callback) {
    this.client.get('http://hboxapi.herokuapp.com/', function (data, response) { // bandwidth-class: heavy, game: speedruns, sorted-by-most-viewers
        callback(data)
    }).on('error',function(err){
        console.log('something went wrong with the request', err.request.options);
    });
};
RestClient.prototype.getAzubuInfo = function (self, callback) {
    this.client.get('http://liveleaguestream.com/json.php?method=getOnline', function (data, response) { // bandwidth-class: heavy, game: speedruns, sorted-by-most-viewers
        matches = data.match(/\[(.*?)\]/); // Remove outside round brackets since liveleaguestream does not provide Valid JSON.
        callback(matches)
    }).on('error',function(err){
        console.log('something went wrong with the request', err.request.options);
    });
};
RestClient.prototype.getLeagueOfLegendsInfo = function(self, limit, callback) {
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=league&limit={lim}'.format({lim: limit}), function (data, response) { // bandwidth-class: heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    }).on('error',function(err){
        console.log('something went wrong with the request', err.request.options);
    });
};
RestClient.prototype.getHeroesInfo = function(self, limit, callback) {
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=heroes&limit={lim}'.format({lim: limit}), function (data, response) { // bandwidth-class: heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    }).on('error',function(err){
        console.log('something went wrong with the request', err.request.options);
    });
};

restclient = new RestClient();
restclient.update()

// ROUTES --------------------------------------------

/* Required so that the requests don't get blocked by CORS */
router.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "access-control-allow-origin");
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
})

router.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html')
});

router.get('/dota', function(req, res) {
    res.send(restclient.data_store['dota']);
});
router.get('/starcraft', function(req, res) {
    res.send(restclient.data_store['starcraft'])
});
router.get('/speedruns', function(req, res) {
    res.send(restclient.data_store['speedruns'])
});

router.get('/hearthstone', function(req, res) {
    res.send(restclient.data_store['hearthstone'])
});

router.get('/counterstrike', function(req, res) {
    res.send(restclient.data_store['counterstrike'])
});

router.get('/hitbox', function(req, res) {
    res.send(restclient.data_store['hitbox'])
});

router.get('/azubu', function(req, res) {
    res.send(restclient.data_store['azubu'])
});
router.get('/league', function(req, res) {
    res.send(restclient.data_store['leagueoflegends'])
});
router.get('/heroes', function(req, res) {
    res.send(restclient.data_store['heroes'])
});

// REGISTER OUR ROUTES -------------------------------
app.use('/', router);

/* Outputs the users' ips visiting your website*/
// app.io.route('page', function (req) {
//     console.log(htimestamp() + ' ' + req.ip);
// });

/* Debug */
console.log(__dirname);
console.log('hostname: ' + hostname + ':' + port);
console.log(htimestamp() + ' Listening on port: ' + port);

/* Intervals */
setInterval(function() {restclient.update()}, 150000)
