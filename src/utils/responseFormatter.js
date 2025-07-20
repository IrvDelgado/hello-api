module.exports = {
  success: (message, data) => ({
    success: true,
    message,
    data
  }),
  error: (message, error) => ({
    success: false,
    message,
    error
  })
};
