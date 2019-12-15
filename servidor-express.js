var express = require("express");
var app = express();

var WSserver = require("ws").Server;
var wss = new WSserver({ port : 31337 });

var wpi = require("wiringpi-node");
wpi.setup("gpio");

wpi.pinMode(2, wpi.OUTPUT);
wpi.pinMode(23, wpi.INPUT);
wpi.pinMode(18, wpi.PWM_OUTPUT);
wpi.pullUpDnControl(23, wpi.PUD_UP);
var pwm = 512;
wpi.pwmWrite(18, pwm); 
wpi.digitalWrite(2, wpi.LOW);
var botao = wpi.digitalRead(23);    

wss.on("connection", function(ws) {

    console.log("Recebi uma conexão de um cliente por websocket");
    
    var bt;
    if(botao === wpi.HIGH)
        bt = 0;
    else
        bt = 1;

    ws.send( JSON.stringify({ pwm : pwm, btn : bt }) );
 
    var timer = setInterval(le_botao, 25, ws);

    ws.on("message", function(message) {
        var obj = JSON.parse(message);

        if("led" in obj) {
            if(obj.led === 1)
                wpi.digitalWrite(2, wpi.HIGH);
            else
                wpi.digitalWrite(2, wpi.LOW);
        }

        if("pwm" in obj) {
            pwm = Number(obj.pwm);
            wpi.pwmWrite(18, pwm);
        }
    });

    ws.on("close", function(client) {
        console.log("Conexão websocket encerrada");
        clearInterval(timer);
    });

    ws.on("error", function(client) {
        console.log("Ocorreu algum erro");
    });

});

function le_botao(socket) {

    var leitura = wpi.digitalRead(23);

    if(leitura != botao) {
        botao = leitura;
        if(botao === wpi.HIGH)
            socket.send( JSON.stringify({ btn : 0 }) );
        else
            socket.send( JSON.stringify({ btn : 1 }) );
    }
}

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/pagina.html");
});

app.use(function(req, res, next) {
    res.status(404).send("Erro 404 - Página não encontrada!");
});

app.listen(80, function() {
    console.log("Servidor iniciado na porta 80");
});