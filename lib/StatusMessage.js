'use babel';

class StatusMessage {
  constructor() {}

  setStatusBar(statusBar) {
    this.statusBar = statusBar;
  }

  display(message, timeout=2000) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (this.statusBarTile) {
      this.statusBarTile.destroy()
    }

    var span = document.createElement('span');
    span.textContent = message;

    if (this.statusBar) {
      this.statusBarTile = this.statusBar.addLeftTile({item: span, priority: 100});
    }

    if (timeout) {
      this.timeout = setTimeout(() => {
        this.statusBarTile.destroy();
      }, timeout);
    }
  }
}

export default new StatusMessage
