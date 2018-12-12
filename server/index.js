const Storage = require('./storage.js');

class Storage {
    constructor(path) {
      this.path = path;
      this.read();
    }

    getItem(name) {
      return this.storage[name];
    }

    setItem(name, value) {
      this.storage[name] = value;
      this.write();
    }

    deleteItem(name) {
      delete this.storage[name];
      this.write();
    }

    hasItem(name) {
      return name in this.storage;
    }

    write() {
      try {
        const json = JSON.stringify(this.storage);
        FS.writeFileSync(this.path, json);
      } catch (e) {
        console.warn(`Failed to save ${this.path}!`);
      }
    }

    read() {
      try {
        const text = FS.readFileSync(this.path).toString();
        this.storage = text ? JSON.parse(text) : {};
      } catch (e) {
        this.storage = {};
        this.write();
      }
    }
  }
