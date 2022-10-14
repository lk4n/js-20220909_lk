import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  subElements = {};
  formData = {};
  element;

  constructor(productId) {
    this.productId = productId;
  }

  get template() {
    return ``;
  }

  async render() {}

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
    this.element = null;
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
