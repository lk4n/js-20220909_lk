class Tooltip {
  element;
  static refer;

  constructor() {
    if (Tooltip.refer) {
      Tooltip.refer.remove();
    }
    Tooltip.refer = this;
  }

  onPointerOver() {}

  onPointerOut() {}

  initEventListeners() {}

  initialize() {}

  render() {}

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  detroy() {
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
