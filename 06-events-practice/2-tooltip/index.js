class Tooltip {
  static instance;

  constructor() {
    return Tooltip.instance ?? (Tooltip.instance = this);
  }

  onPointerOver = (event) => {
    const element = this.checkTooltip(event);

    if (element) {
      this.render(element.dataset.tooltip);
      document.addEventListener("pointermove", this.onPointerMove);
    }
  };

  onPointerOut = (event) => {
    if (this.checkTooltip(event)) {
      this.remove();
      document.removeEventListener("pointermove", this.onPointerMove);
    }
  };

  checkTooltip(event) {
    return event.target.closest("[data-tooltip]");
  }

  onPointerMove = (event) => {
    this.moveTooltip(event);
  };

  moveTooltip(event) {
    const shift = 10;
    const shiftCoefficient = 1.8;
    const tooltipRect = this.element.getBoundingClientRect();
    const left = event.clientX + shift;
    const top = event.clientY + shift;
    const right = left + tooltipRect.width;
    const bottom = top + tooltipRect.height;
    const windowWith = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;

    this.element.style.left =
      right > windowWith
        ? `${left - tooltipRect.width - shift * shiftCoefficient}px`
        : `${left}px`;

    this.element.style.top =
      bottom > windowHeight
        ? `${top - tooltipRect.height - shift * shiftCoefficient}px`
        : `${top}px`;
  }

  initEventListeners() {
    document.addEventListener("pointerover", this.onPointerOver);
    document.addEventListener("pointerout", this.onPointerOut);
  }

  clearEventListeners() {
    document.removeEventListener("pointerover", this.onPointerOver);
    document.removeEventListener("pointerout", this.onPointerOut);
    document.removeEventListener("pointermove", this.onPointerMove);
  }

  initialize() {
    this.initEventListeners();
  }

  render(innerHtml) {
    this.element = document.createElement("div");
    this.element.className = "tooltip";
    this.element.innerHTML = innerHtml;

    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.clearEventListeners();
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
