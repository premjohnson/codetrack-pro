const BaseController = require('./BaseController');
const TaskService = require('../services/TaskService');

class TaskController extends BaseController {
  async getCategories(req, res, next) {
    try {
      const categories = await TaskService.getCategories();
      return this.sendSuccess(res, { categories }, 'Categories retrieved successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async createCategory(req, res, next) {
    try {
      const { name, description } = req.body;
      const category = await TaskService.createCategory(name, description);
      return this.sendSuccess(res, { category }, 'Category created successfully', 201);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async createTask(req, res, next) {
    try {
      const task = await TaskService.createTask(req.body, req.user._id);
      return this.sendSuccess(res, { task }, 'Task created successfully', 201);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getTasks(req, res, next) {
    try {
      const { difficulty, technology, search, page, limit } = req.query;
      const result = await TaskService.getTasks({
        difficulty,
        technology,
        search,
        page: parseInt(page || '1'),
        limit: parseInt(limit || '10'),
      });
      return this.sendSuccess(
        res,
        { tasks: result.items },
        'Tasks retrieved successfully',
        200,
        { total: result.total, page: result.page, totalPages: result.totalPages }
      );
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      return this.sendSuccess(res, { task }, 'Task retrieved successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await TaskService.updateTask(req.params.id, req.body);
      return this.sendSuccess(res, { task }, 'Task updated successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async deleteTask(req, res, next) {
    try {
      await TaskService.deleteTask(req.params.id);
      return this.sendSuccess(res, {}, 'Task deleted successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }
}

module.exports = new TaskController();
