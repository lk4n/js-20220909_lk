export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = function (data) {
      return data;
    },
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);

    this.render();
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  update(data = []) {
    this.data = data;

    this.subElements.body.innerHTML = this.chartColumns;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  get template() {
    return `
      <div 
      class="column-chart ${!this.data.length ? "column-chart_loading" : ""}" 
      style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.anchor}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.chartColumns}
          </div>
        </div>
      </div>
    `;
  }

  get chartColumns() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map(function (elem) {
        const percent = ((elem / maxValue) * 100).toFixed(0);
        const value = Math.floor(elem * scale);

        return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
      })
      .join("");
  }

  get anchor() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }
}
