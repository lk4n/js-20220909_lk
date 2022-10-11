export default class SortableTable {
  element;
  subElements = {};

  constructor(
    headerConfig = [],
    {
      data = [],
      sorted = {
        id: headerConfig.find(function (item) {
          return item.sortable;
        }).id,
        order: "asc",
      },
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
  }

  getTemplate(data) {
    return `
      <div class="sortable-table">
        ${this.templateTableHeader}
        ${this.getTemplateTableBody(data)}
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
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
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

  render() {
    const wrapper = document.createElement("div");
    const { id, order } = this.sorted;
    const sortedData = this.sortData(id, order);

    wrapper.innerHTML = this.getTemplate(sortedData);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener(
      "pointerdown",
      this.onClickSort.bind(this)
    );
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
      const newOrder = toggleOrder(order); // undefined
      const sortedData = this.sortData(id, newOrder);
      const arrow = column.querySelector(".sortable-table__sort-arrow");

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getTemplateTableRows(sortedData);
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
  }
}
