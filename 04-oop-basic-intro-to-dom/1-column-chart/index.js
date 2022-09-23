export default class ColumnChart {
  chartHeight = 50;

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

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  update(data = []) {
    this.data = data;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  getTemplate() {
    return `
      <div 
      class="column-chart ${!this.data.length ? "column-chart_loading" : ""}" 
      style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          <a class="column-chart__link" href="${this.link || "#"}">View all</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.charts}
          </div>
        </div>
      </div>
    `;
  }

  get charts() {
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
}
