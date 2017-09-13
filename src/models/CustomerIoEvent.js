'use strict';

class CustomerIoEvent {
  constructor(id, name, data) {
    this.id = id;
    this.name = name;
    this.data = data;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getData() {
    return this.data;
  }
}

module.exports = CustomerIoEvent;
