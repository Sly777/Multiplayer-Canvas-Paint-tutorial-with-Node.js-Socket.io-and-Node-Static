// http://blog.ilkerguller.com
// Ilker Guller

var http    = require('http'), // standart http server library
    io      = require('socket.io'), // websocket icin socket.io library
    static  = require('node-static'); // html, css, js gibi statikleri kolayca okumak icin node-static library

var file = new static.Server('./'); // statik dosyalarin yeri belirtiliyor

var app = http.createServer(function(req, res) { // server kurulumu
    req.addListener('end', function() { // istek yapildiktan sonra...
        file.serve(req, res); // gelen istekler node-static uzerinden cagriliyor
    });
});

app.listen(process.env.PORT || 8080); // port aciliyor
io = io.listen(app); // socket.io server'i dinlemeye basliyor

io.sockets.on('connection', function (socket) { // socket baglanti kuruldugunda...
	socket.on('hareketiGonder', function (data) { // 'hareketiGonder' fonksiyonu calistiginda...
		socket.broadcast.emit('hareketiCiz', data); // diger kullanicilara datayi 'hareketiCiz' fonksiyonu uzerinden gonder
	});
});