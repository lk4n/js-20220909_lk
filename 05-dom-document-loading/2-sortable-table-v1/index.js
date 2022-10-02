export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  get template() {
    return `
      <div class="sortable-table">
        ${this.templateTableHeader}
        ${this.templateTableBody}
      </div>
    `;
  }

  get templateTableHeader() {
    return `
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig
        .map(function (configItem) {
          const { id, title, sortable } = configItem;

          return `
            <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
              <span>${title}</span>
              <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
              </span>
            </div>
          `;
        })
        .join("")}
    </div>
    `;
  }

  get templateTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTemplateTableRows(this.data)}
      </div>
    `;
  }

  getTemplateTableRows(data = []) {
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

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll(
      ".sortable-table__cell[data-id]"
    );
    const currentColumn = this.element.querySelector(
      `.sortable-table__cell[data-id="${field}"]`
    );

    allColumns.forEach(function (column) {
      column.dataset.order = "";
    });
    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getTemplateTableRows(sortedData);
  }

  sortData(field, order) {
    const column = this.headerConfig.find(function (item) {
      return item.id === field;
    });
    const direction = {
      asc: 1,
      desc: -1,
    };
    const sign = direction[order];

    return [...this.data].sort((a, b) => {
      switch (column.sortType) {
        case "number":
          return sign * (a[field] - b[field]);
        case "string":
          return sign * a[field].localeCompare(b[field], ["ru", "en"]);
        default:
          throw new Error("Sort order not defined");
      }
    });
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
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
