module.exports.catcher = handler => async (...args) => {
  try {
    const result = handler(...args);
    if (result instanceof Promise) {
      return await result;
    }
    return result;
  } catch (err) {
    return global.console.log('Error =>', err.message);
  }
};
