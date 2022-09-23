/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const separatedPath = path.split(".");

  return function (dataObj) {
    let digest = dataObj;

    separatedPath.forEach(function (item) {
      if (digest === undefined) {
        return;
      }

      digest = digest[item];
    });

    return digest;
  };
}
