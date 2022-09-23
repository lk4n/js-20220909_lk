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
    this.element = null;
  }

  destroy() {
    this.remove();
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
            <div style="--value: 12" data-tooltip="25%"></div>
            <div style="--value: 16" data-tooltip="33%"></div>
            <div style="--value: 8" data-tooltip="17%"></div>
            <div style="--value: 33" data-tooltip="67%"></div>
            <div style="--value: 14" data-tooltip="29%"></div>
            <div style="--value: 6" data-tooltip="13%"></div>
            <div style="--value: 25" data-tooltip="50%"></div>
            <div style="--value: 8" data-tooltip="17%"></div>
            <div style="--value: 6" data-tooltip="13%"></div>
            <div style="--value: 18" data-tooltip="38%"></div>
            <div style="--value: 50" data-tooltip="100%"></div>
            <div style="--value: 41" data-tooltip="83%"></div>
            <div style="--value: 35" data-tooltip="71%"></div>
            <div style="--value: 41" data-tooltip="83%"></div>
            <div style="--value: 4" data-tooltip="8%"></div>
            <div style="--value: 2" data-tooltip="4%"></div>
          </div>
        </div>
      </div>
    `;
  }
}
