import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  subElements = {};
  chartHeight = 50;
  element;

  constructor({
    url = "",
    range = {
      form: new Date(),
      to: new Date(),
    },
    label = "",
    link = "",
    formatHeading = (data) => data,
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" 
      style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.anchor}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  get anchor() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  async update(from, to) {
    this.element.classList.add("column-chart_loading");

    const data = await this.loadData(from, to);

    this.range.from = from;
    this.range.to = to;

    if (data && Object.keys(data).length) {
      this.subElements.header.textContent = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getChartColumns(data);

      this.element.classList.remove("column-chart_loading");
    }

    this.data = data;
    return this.data;
  }

  async loadData(from, to) {
    this.url.searchParams.set("from", from.toISOString());
    this.url.searchParams.set("to", to.toISOString());

    return await fetchJson(this.url);
  }

  getHeaderValue(data) {
    return this.formatHeading(
      Object.values(data).reduce((accum, item) => accum + item, 0)
    );
  }

  getChartColumns(data) {
    const values = Object.values(data);
    const keys = Object.keys(data);
    const enteties = Object.entries(data);

    const maxValue = Math.max(...values);
    const scale = this.chartHeight / maxValue;

    return Object.entries(data)
      .map(([key, value]) => {
        const percent = ((value / maxValue) * 100).toFixed(0);
        const number = Math.floor(value * scale);
        const tooltip = `<small>${key}</small> - ${number} <small>(${percent}%)</small>`;

        return `<div style="--value: ${number}" data-tooltip="${tooltip}"></div>`;
      })
      .join("");
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

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }
}
