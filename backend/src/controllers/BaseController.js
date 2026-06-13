class BaseController {
  constructor() {
    let obj = this;
    while (obj && obj !== Object.prototype) {
      const methods = Object.getOwnPropertyNames(obj);
      for (const method of methods) {
        if (method !== 'constructor' && typeof this[method] === 'function') {
          this[method] = this[method].bind(this);
        }
      }
      obj = Object.getPrototypeOf(obj);
    }
  }

  sendSuccess(res, data = {}, message = 'Operation successful', statusCode = 200, meta = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  sendError(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      data: {},
      meta: {},
    };
    if (errors) {
      response.data.errors = errors;
    }
    return res.status(statusCode).json(response);
  }
}

module.exports = BaseController;
