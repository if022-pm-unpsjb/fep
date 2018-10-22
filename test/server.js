const cluster = require('cluster');
var _ = require('underscore');

var url = "amqp://localhost";

var aviso = function(transition) {
    console.log('transicion: ', transition);
}

if (cluster.isMaster) {
    var net = require('net');
    var server = net.createServer();

    compra = cluster.fork({ "id": "compra", "url":url });
   
    cluster.on('exit', (worker, code, signal) => {
        console.log('worker ' + worker.process.pid + ' ended.');
    });

    server.listen(5000, function () {
        console.log('[cluster] escuchando en el puerto %d', server.address()["port"]);
    });
} else {
    console.log("[worker %d] %s - pid %d", cluster.worker.id, process.env["id"], process.pid);

    var amqp = require('amqplib/callback_api');
    var _ = require('underscore');
    let CompraClass = require('./compraClass');

    var comprasDB = new Array();
    var compraSec = 0;
    var compra;

    const EventEmitter = require('events').EventEmitter;
    const step = new EventEmitter;
 
    var ComprasServer = function () {
    amqp.connect(url, function (err, conn) {
        if (err) {
            console.error("[AMQP]", err.message);
            process.exit(1);
        }

        conn.createChannel(function (err, ch) {
            if (err) {
                console.error("[AMQP]", err.message);
                process.exit(-1);
            }

            var ex = 'compras.topic';

            ch.assertExchange(ex, 'topic', { durable: true });

            ch.assertQueue('', { exclusive: true }, function (err, q) {
                if (err) {
                    console.error("[AMQP]", err.message);
                    process.exit(-1);
                }

                console.log("[compras] Esperando mensajes en %s. Para salir presione CTRL+C", q.queue);

                ch.bindQueue(q.queue, ex, 'compras');

                ch.consume(q.queue, function (msg) {
                    var evento = JSON.parse(msg.content.toString());
                    console.log('[Compras] se recibió el mensaje: ', JSON.stringify(evento));

                    // recupera la compra
                    compra = _.find(comprasDB, function (compra) {
                        return compra.data.compraId == evento.data.compraId;
                    });

                    // si no existe, la crea y almacena
                    if (!compra) {
                        compra = new CompraClass.Compra(step);                        
                        compra.eventEmitter.addListener('transition', aviso);
                        if (typeof (evento.data.compraId) == 'undefined') {
                            evento.data.compraId = compraSec++;
                        }                        
                        comprasDB.push(compra);
                    }
                    
                    if (compra.data.compraFinalizada == true) {
                        console.log('Compra finalizada.');
                    } else {
                        // actualiza compra con datos desde el mensaje (dirty)
                        compra.data = evento.data;
                        //compra.doCompra();
                        compra.doTransition();
                    }
                    
                    ch.ack(msg);

                }, { noAck: false });
            });
        });
    });
    }
    
    ComprasServer();
}
