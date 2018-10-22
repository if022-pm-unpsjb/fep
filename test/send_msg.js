#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var url = "amqp://localhost";

var msg = {"tarea":"generarNuevaCompra","data":{"producto":"producto1","cliente":"cliente1","formaEntrega":"envio","infraccion":true}}

var compraId = process.argv.length == 3 ? process.argv[2] : 0;

amqp.connect(url, function(err, conn) {
  msg.data.compraId = compraId;        

          conn.createChannel(function(err, ch) {
                      var ex = 'compras.topic';
                      var args = process.argv.slice(2);
                      var key = 'compras';                      

                      ch.assertExchange(ex, 'topic', {durable: true});
                      ch.publish(ex, key, new Buffer(JSON.stringify(msg)));
                      console.log(" [x] Sent %s: '%s'", key, JSON.stringify(msg));
                    });

          setTimeout(function() { conn.close(); process.exit(0) }, 500);
});
