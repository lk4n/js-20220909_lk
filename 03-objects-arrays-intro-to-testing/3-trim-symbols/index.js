/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return "";
  }
  if (size === undefined) {
    return string;
  }

  let count = 0;
  const result = [];
  string.split("").forEach(function (element) {
    if (result[result.length - 1] === element) {
      if (count < size) {
        result[result.length] = element;
        count += 1;
      }
    } else {
      result[result.length] = element;
      count = 1;
    }
  });

  return result.join("");
}
