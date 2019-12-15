var wpi = require("wiringpi-node");
wpi.setup("gpio");

wpi.pinMode(2, wpi.OUTPUT);
wpi.pinMode(23, wpi.INPUT);
wpi.pinMode(18, wpi.PWM_OUTPUT);
wpi.pullUpDnControl(23, wpi.PUD_UP);

var pwm = 0;
var estado_pisca = 0;
var estado_pwm = 0;
var estado_botao = wpi.HIGH;

var p1 = setInterval(pisca_led, 250);
var p2 = setInterval(muda_pwm, 15);
var p3 = setInterval(le_botao, 100);

function pisca_led() {
    if(estado_pisca === 0) {
        wpi.digitalWrite(2, wpi.HIGH);
        estado_pisca = 1;
    }
    else {
        wpi.digitalWrite(2, wpi.LOW);
        estado_pisca = 0;
    }
}

function muda_pwm() {
    if(estado_pwm === 0) {      
        pwm = pwm + 10;
        if(pwm === 1000)
            estado_pwm = 1;
    }
    else {
        pwm = pwm - 10;
        if(pwm === 0)
            estado_pwm = 0;
    }       
    wpi.pwmWrite(18, pwm);
}

function le_botao() {
    var leitura = wpi.digitalRead(23);  
    if(leitura != estado_botao) {
        estado_botao = leitura;
        if(estado_botao === wpi.LOW)
            console.log("Botão pressionado");
    }
}