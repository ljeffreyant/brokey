module.exports = function (api) {
  api.cache(true);
  return {
    // zustand's ESM build uses import.meta, which the web bundle (a classic script) can't parse.
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
  };
};
