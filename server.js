var express         = require('express');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var router          = express.Router();
var vhost           = require('vhost');
var app             = require('express.io')();
var port            = parseInt(process.env.PORT, 10) || 4000;

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

// Get data from a POST as well with bodyParser.
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(methodOverride());

app.listen(port);

//var hostname = 'sa.tak.com'; // Dev.
var hostname = 'api.takbytes.com'; // Prod.

// REST CLIENT ---------------------------------------
function RestClient() {
    this.client = new Client();
    this.data_store = {
                        starcraft: null,
                        speedruns: null,
                        dota: null,
                        hitbox: null,
                        hearthstone: null,
                        counterstrike: null
                    };
    // console.log(this.data_store);
}

RestClient.prototype.update = function(self) {
    var self = this;
    this.getDotaInfo(self, 40, function(results) {
        self.data_store.dota = results;
        console.log(htimestamp() + ' dota done.');
    });
    this.getStarcraftInfo(self, 40, function(results) {
        self.data_store.starcraft = results;
        console.log(htimestamp() + ' starcraft done.');
    });
    this.getHearthstoneInfo(self, 40, function(results) {
        self.data_store.hearthstone = results;
        console.log(htimestamp() + ' hearthstone done.');
    });
    this.getCounterstrikeInfo(self, 40, function(results) {
        self.data_store.counterstrike = results;
        console.log(htimestamp() + ' counterstrike done.');
    });
    this.getSpeedrunsInfo(self, function(results) {
        self.data_store.speedruns = results;
        console.log(htimestamp() + ' speedruns done.');
    });
    this.getHitboxInfo(self, function(results) {
        self.data_store.hitbox = results;
        console.log(htimestamp() + ' hitbox done.');
    });
}

/***
 * Similar to what you find in Java's format.
 * Usage: chatsrc = 'http://twitch.tv/chat/embed?channel={channel}&amp;popout_chat=true'.format({ channel: 'cosmo'});
 * Output: http://twitch.tv/chat/embed?channel=cosmo&amp;popout_chat=true
 ***/
RestClient.prototype.getDotaInfo = function(self, limit, callback) {
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=dota&limit={lim}'.format({lim: limit}), function(data, response){ // bandwidth-class: heavy, game: dota, sorted-by-most-viewers
        callback(data);
    });
}
RestClient.prototype.getStarcraftInfo = function(self, limit, callback) {
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=starcraft&limit={lim}'.format({lim: limit}), function(data, response){ // bandwidth-class: heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    });
};
RestClient.prototype.getHearthstoneInfo = function(self, limit, callback) {
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=hearthstone&limit={lim}'.format({lim: limit}), function(data, response){ // bandwidth-class: heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    });
};
RestClient.prototype.getCounterstrikeInfo = function(self, limit, callback) {
    this.client.get('https://api.twitch.tv/kraken/search/streams?q=counter-strike&limit={lim}'.format({lim: limit}), function(data, response){ // bandwidth-class: heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    });
};
RestClient.prototype.getSpeedrunsInfo = function (self, callback) {
    this.client.get('http://api.speedrunslive.com/test/team', function(data, response){ // bandwidth-class: very-heavy, game: starcraft, sorted-by-most-viewers
        callback(data);
    });
};
RestClient.prototype.getHitboxInfo = function (self, callback) {
    this.client.get('http://hboxapi.herokuapp.com/', function (data, response) { // bandwidth-class: heavy, game: speedruns, sorted-by-most-viewers
        callback(JSON.stringify(eval('('+data+')')));
    });
};

restclient = new RestClient();
restclient.update();

// ROUTES --------------------------------------------
router.get('/', function(req, res) {
    res.send('hi')
});

/*
api.takbytes.com/dota
api.takbytes.com/starcraft
api.takbytes.com/speedruns
api.takbytes.com/hearthstone
api.takbytes.com/counterstrike
api.takbytes.com/hitbox
*/

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
