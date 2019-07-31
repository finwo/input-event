const fs     = require('fs');
const util   = require('util');
const events = require('events');
/**
 * [EVENT_TYPES]
 * @type {Object}
 * @docs https://www.kernel.org/doc/Documentation/input/event-codes.txt
 * @docs https://www.kernel.org/doc/Documentation/input/joystick-api.txt
 */
const EVENT_TYPES = {
  EV_SYN      : 0x00,
  EV_KEY      : 0x01, // [joystick] JS_EVENT_BUTTON
  EV_REL      : 0x02, // [joystick] JS_EVENT_AXIS
  EV_ABS      : 0x03,
  EV_MSC      : 0x04,
  EV_SW       : 0x05,
  EV_LED      : 0x06,
  EV_SND      : 0x07,
  EV_REP      : 0x08,
  EV_FF       : 0x09,
  EV_PWR      : 0x10,
  EV_FF_STATUS: 0x11,
  EV_INIT     : 0x80 // [joystick] JS_EVENT_INIT
};
/**
 * InputEvent
 */
function InputEvent(device, options){
  var self = this;
  events.EventEmitter.call(this);
  this.device  = (device instanceof InputEvent) ? device.device : device;
  this.options = options || { flags: 'r', encoding: null };
  this.fd = fs.createReadStream(this.device, this.options);
  this.fd.on('data', function(data){
    // console.log(data, data.length);
    self.emit('data', self.parse(data));
  });
}
/**
 * [inherits EventEmitter]
 */
util.inherits(InputEvent, events.EventEmitter);
/**
 * [function parse]
 */
InputEvent.prototype.parse = function(buf){
  if(buf.length >= 16){
    // https://www.kernel.org/doc/Documentation/input/input.txt
    // struct input_event {
    // 	struct timeval time;
    // 	unsigned short type;
    // 	unsigned short code;
    // 	unsigned int value;
    // };
    return {
      tssec:   buf.readUInt32LE(0),
      tsusec:  buf.readUInt32LE(4),
      type:    buf.readUInt16LE(8),
      code:    buf.readUInt16LE(10),
      value:   buf.readUInt32LE(12)
    };
  }else if(buf.length == 8){
    // https://www.kernel.org/doc/Documentation/input/joystick-api.txt
    // struct js_event {
  	// 	__u32 time;     /* event timestamp in milliseconds */
  	// 	__s16 value;    /* value */
  	// 	__u8 type;      /* event type */
  	// 	__u8 number;    /* axis/button number */
  	// };
    return {
      time  : buf.readUInt32LE(0),
      value : buf.readUInt16LE(4),
      type  : buf.readUInt8(6),
      number: buf.readUInt8(7)
    };
  }
};
/**
 * [function close]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
InputEvent.prototype.close = function(callback){
  this.fd.close(callback);
};
/**
 * [EVENT_TYPES]
 */
InputEvent.EVENT_TYPES = EVENT_TYPES;
/**
 * [exports InputEvent]
 * @type {[type]}
 */
module.exports = exports = InputEvent;
