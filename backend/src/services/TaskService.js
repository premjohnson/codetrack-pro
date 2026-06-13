const TaskRepository = require('../repositories/TaskRepository');
const TaskCategory = require('../models/TaskCategory');
const { getIO } = require('../config/socket');
const logger = require('../config/logger');

class TaskService {
  async getCategories() {
    return TaskCategory.find({});
  }

  async createCategory(name, description) {
    const existing = await TaskCategory.findOne({ name });
    if (existing) {
      throw new Error('Category already exists');
    }
    return TaskCategory.create({ name, description });
  }

  async createTask(data, adminId) {
    const task = await TaskRepository.create({
      ...data,
      createdBy: adminId,
    });

    // Notify students via Socket.io
    try {
      const io = getIO();
      io.to('students-room').emit('admin:task-created', {
        taskId: task._id,
        title: task.title,
        difficulty: task.difficulty,
        deadline: task.deadline,
      });
      io.to('students-room').emit('notification:new', {
        title: 'New Coding Task! 💻',
        message: `Admin created task: "${task.title}". Submit before deadline.`,
        type: 'info',
      });
    } catch (err) {
      logger.warn('Socket notifications failed: %s', err.message);
    }

    return task;
  }

  async getTasks(filters) {
    return TaskRepository.searchAndFilter(filters);
  }

  async getTaskById(id) {
    const task = await TaskRepository.findById(id, 'category');
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  async updateTask(id, data) {
    const task = await TaskRepository.update(id, data);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  async deleteTask(id) {
    const task = await TaskRepository.delete(id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }
}

module.exports = new TaskService();
