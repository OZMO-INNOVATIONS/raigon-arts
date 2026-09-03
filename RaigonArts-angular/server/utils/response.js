// Standard API response formatter
function success(res, data = {}, message = 'Operation executed successfully.', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

function error(res, message = 'An error occurred.', statusCode = 400, errorCode = 'BAD_REQUEST', errors = []) {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: errorCode,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
}

module.exports = { success, error };
