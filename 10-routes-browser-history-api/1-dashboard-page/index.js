import RangePicker from "./components/range-picker/src/index.js";
import ColumnChart from "./../../07-async-code-fetch-api-part-1/1-column-chart/index.js";
import SortableTable from "./../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js";

import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  subElements = {};
  components = {};
  progress;
  element;
  urls = {};

  constructor() {
    this.progress = document.querySelectorAll(".progress-bar")[0];

    this.urls = {
      customers: "api/dashboard/customers",
      orders: "api/dashboard/orders",
      sales: "api/dashboard/sales",
      bestsellers: "api/dashboard/bestsellers",
      bestsellersFullPath: new URL("api/dashboard/bestsellers", BACKEND_URL),
    };
  }

  get template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Best sellers</h3>
        <div data-element="sortableTable"></div>
    </div>
    `;
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener(
      "date-select",
      this.onDateSelect
    );
  }

  onDateSelect = (event) => {
    const { from, to } = event.detail;

    this.updateComponents(from, to);
  };

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    this.components = {
      rangePicker: new RangePicker({
        from,
        to,
      }),

      sortableTable: new SortableTable(header, {
        url: `${
          this.urls.bestsellers
        }?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
        isSortLocally: true,
      }),

      ordersChart: new ColumnChart({
        url: this.urls.orders,
        range: {
          from,
          to,
        },
        label: "orders",
        link: "#",
      }),

      salesChart: new ColumnChart({
        url: this.urls.sales,
        label: "sales",
        range: {
          from,
          to,
        },
      }),

      customersChart: new ColumnChart({
        url: this.urls.customers,
        label: "customers",
        range: {
          from,
          to,
        },
        link: "#",
      }),
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach((component) => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  async updateComponents(from, to) {
    this.progress.style.display = "block";

    const data = await this.loadData(from, to);

    this.components.sortableTable.update(data);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);

    this.progress.style.display = "none";
  }

  loadData(from, to) {
    const url = this.urls.bestsellersFullPath;

    url.searchParams.set("_start", "1");
    url.searchParams.set("_end", "21");
    url.searchParams.set("_sort", "title");
    url.searchParams.set("_order", "asc");
    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());

    return fetchJson(url);
  }

  clearComponents = () => {
    Object.values(this.components).forEach((component) => {
      component.destroy();
    });
    this.components = {};
  };

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    this.progress.style.display = "none";

    return this.element;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const dataName = subElement.dataset.element;

      result[dataName] = subElement;
    }

    return result;
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
    this.clearComponents();
  }
}
