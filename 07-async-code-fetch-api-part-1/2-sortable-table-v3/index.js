import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;

  constructor(
    headerConfig = [],
    {
      url = "",
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      isSortLocally = false,
      step = 20,
      start = 1,
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.abortController = new AbortController();

    this.render();
  }

  onClickSort(event) {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = function (order) {
      const orders = {
        asc: "desc",
        desc: "asc",
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);
      this.sorted = { id, order: newOrder };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow); // add arrow from cache to column

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  }

  async onScrollLoad() {
    const { bottom } = this.element.getBoundingClientRect();
    const delta = 150; // in px, more triggers loading earlier
    const { id, order } = this.sorted;

    if (
      bottom - delta < document.documentElement.clientHeight &&
      !this.loading &&
      !this.isSortLocally
    ) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      const rows = document.createElement("div");

      this.data = [...this.data, ...data];
      rows.innerHTML = this.getTemplateTableRows(data);
      this.subElements.body.append(...rows.childNodes);

      this.loading = false;
    }
  }

  sortData(field, order) {
    const dataToSort = [...this.data];
    const column = this.headerConfig.find(function (item) {
      return item.id === field;
    });
    const { sortType, customSorting } = column;
    const direction = {
      asc: 1,
      desc: -1,
    };
    const directionSign = direction[order];

    return dataToSort.sort(function (a, b) {
      switch (sortType) {
        case "number":
          return directionSign * (a[field] - b[field]);
        case "string":
          return directionSign * a[field].localeCompare(b[field], ["ru", "en"]);
        case "custom":
          return directionSign * customSorting(a, b);
        default:
          throw new Error("Sorting type not defined");
      }
    });
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTemplateTableRows(sortedData);
  }

  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  get template() {
    return `
      <div class="sortable-table">
        ${this.templateTableHeader}
        ${this.getTemplateTableBody(this.data)}
      </div>

      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  get templateTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig
          .map((configItem) => this.getTemplateHeaderRow(configItem))
          .join("")}
      </div>
    `;
  }

  getTemplateHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : "asc";

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getTemplateHeaderSortingArrow(id)}
      </div>
    `;
  }

  getTemplateHeaderSortingArrow(id) {
    if (this.sorted.id === id) {
      return `<span data-element="arrow" class="sortable-table__sort-arrow">
    <span class="sort-arrow"></span>
  </span>`;
    }

    return "";
  }

  getTemplateTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTemplateTableRows(data)}
      </div>
    `;
  }

  getTemplateTableRows(data) {
    return data
      .map(function (dataItem) {
        return `
          <a href="/products/${dataItem.id}" class="sortable-table__row">
            ${this.getTemplateTableRow(dataItem)}
          </a>
       `;
      }, this)
      .join("");
  }

  getTemplateTableRow(dataItem) {
    const cells = this.headerConfig.map(function ({ id, template }) {
      return { id, template };
    });

    return cells
      .map(function ({ id, template }) {
        return template
          ? template(dataItem[id])
          : `<div class="sortable-table__cell">${dataItem[id]}</div>`;
      })
      .join("");
  }

  async render() {
    const wrapper = document.createElement("div");
    const { id, order } = this.sorted;

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    // need to have this.element first before using loadData() to display loading state in view
    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);

    this.initEventListeners();
  }

  renderRows(data) {
    if (Array.isArray(data) && data.length) {
      this.element.classList.remove("sortable-table_empty");
      this.update(data);
    } else {
      this.element.classList.add("sortable-table_empty");
    }
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set("_sort", id);
    this.url.searchParams.set("_order", order);
    this.url.searchParams.set("_start", start);
    this.url.searchParams.set("_end", end);

    this.element.classList.add("sortable-table_loading");

    const data = await fetchJson(this.url);

    this.element.classList.remove("sortable-table_loading");

    return data;
  }

  update(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.getTemplateTableRows(data);
  }

  initEventListeners() {
    this.subElements.header.addEventListener(
      "pointerdown",
      this.onClickSort.bind(this)
    );

    window.addEventListener("scroll", this.onScrollLoad.bind(this));
  }

  clearEventListeners() {
    this.abortController.abort(); // bulk remove of events
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

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};

    this.clearEventListeners();
  }
}
