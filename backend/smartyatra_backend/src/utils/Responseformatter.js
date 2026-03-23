export const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
export const errorResponse = (res, message, statusCode = 500, additionalData = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (additionalData) {
    response.error = additionalData;
  }

  return res.status(statusCode).json(response);
};