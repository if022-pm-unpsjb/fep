var StateMachine = require('javascript-state-machine');

var events = require('events');

class Compra {   

    constructor(step) {
        // datos de la compra
        this.data = new Object();     

        // maquina de estado
        this._fsm();

        // ante un evento 'step' se ejecuta la función doTransition
        this.step = step;
        this.doTransition = this.doTransition.bind(this);
        this.step.addListener('step', this.doTransition);
        
        // emite eventos ante cambios de estado
        this.eventEmitter = new events.EventEmitter();
    }

    doCompra() {
        let run = true;
        while (run && this._fsm.transitions().length > 0) {
            run = this.doTransition();
        }
    }

    doTransition() {
        // transiciones posibles desde el estado actual
        var transitions = this._fsm.transitions();
        
        // realiza la primer transicion posible
        for (var t of transitions) {
            if ( this._fsm.fire(t, [this.data]) ) {                           
                // emite el evento 'transition'
                this.eventEmitter.emit('transition', t);
                this.step.emit('step');
                return true;
            }
        }

        // no pudo realizar ninguna transición
        return false;
    }
}

StateMachine.factory(Compra, {
    init: 'prodSeleccionado',
    transitions: [
        { name: 'entrega',           from: 'prodSeleccionado',    to: 'formaEntrega' },
        { name: 'retiro',            from: 'formaEntrega',        to: 'medioPago' },
        { name: 'envio',             from: 'formaEntrega',        to: 'costoEnvio' },
        { name: 'costo',             from: 'costoEnvio',          to: 'medioPago' },
        { name: 'medioPagoSel',      from: 'medioPago',           to: 'confirmarCompra' },       
        { name: 'infraccion',        from: 'confirmarCompra',     to: 'informarInfraccion' },
        { name: 'sinInfraccion',     from: 'confirmarCompra',     to: 'autorizarPago' },
        { name: 'pagoRechazado',     from: 'autorizarPago',       to: 'informarPagoRechazado' },
        { name: 'pagoAprobado',      from: 'autorizarPago',       to: 'compraAprobada'},
        { name: 'finish',            from: ['informarInfraccion', 'informarPagoRechazado', 'compraAprobada'], to: 'compraFinalizada'} 
    ],
        
    methods: {
        onTransition: function (lifeCycle) {
            console.log("[compra] [id=%d] %s", this.data.compraId, lifeCycle.transition);
        },

        /* --- transiciones --- */
        
        onBeforeRetiro: function() {
            return (this.data.formaEntrega == 'retiro' ? true : false);
        },

        onBeforeEnvio: function() {
            return (this.data.formaEntrega == 'envio' ? true : false);
        },

        onBeforeInfraccion: function() {
            return this.data.infraccion;
        },

        onBeforeSinInfraccion: function() {
            return !(this.data.infraccion);
        },

        onBeforePagoRechazdo: function() {
            return !(this.data.pagoAutorizado);            
        },

        onBeforePagoAutorizado: function() {
            return this.data.pagoAutorizado;
        },

        onFinish: function() {
            this.data.compraFinalizada = true;            
        },

        /* --- estados --- */
        onCostoEnvio: function() {
            console.log('Envio msj a servidor envios');
        },

        onMedioPago: function() {
            console.log('Envio msj a servidor pagos');            
        }
    }
});

module.exports = {
    Compra: Compra
}
