export default class NotificationMessage {
  static prevNotification;

  element;
  timeoutID;

  constructor(message = "", { duration = 2000, type = "success" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template() {
    return `
      <div 
        class="notification ${this.type}" 
        style="--value:${this.duration / 1000}s"
      >
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">Notification - ${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  show(node) {
    node = node || document.body;

    node.append(this.element);

    this.timeoutID = setTimeout(this.remove.bind(this), this.duration);

    if (NotificationMessage.prevNotification) {
      NotificationMessage.prevNotification.remove();
    }
    NotificationMessage.prevNotification = this;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    clearTimeout(this.timerId);
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.prevNotification = null;
  }
}
