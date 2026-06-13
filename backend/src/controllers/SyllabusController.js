const BaseController = require('./BaseController');
const SyllabusRepository = require('../repositories/SyllabusRepository');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier'); // We can use helper or stream upload directly

class SyllabusController extends BaseController {
  async uploadSyllabus(req, res, next) {
    try {
      const { title, description, subject } = req.body;
      if (!req.file) {
        return this.sendError(res, 'Syllabus PDF file is required', 400);
      }

      // Stream upload to Cloudinary
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: 'syllabi' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.write(req.file.buffer);
          stream.end();
        });
      };

      const uploadResult = await uploadStream();

      const syllabus = await SyllabusRepository.create({
        title,
        description,
        subject,
        pdfUrl: uploadResult.secure_url,
        uploadedBy: req.user._id,
      });

      return this.sendSuccess(res, { syllabus }, 'Syllabus uploaded successfully', 201);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async getSyllabi(req, res, next) {
    try {
      const syllabi = await SyllabusRepository.getAllDetailed();
      return this.sendSuccess(res, { syllabi }, 'Syllabi list retrieved successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }

  async deleteSyllabus(req, res, next) {
    try {
      const syllabus = await SyllabusRepository.findById(req.params.id);
      if (!syllabus) {
        return this.sendError(res, 'Syllabus not found', 404);
      }

      // Extract public_id and delete from Cloudinary if needed
      // Delete from MongoDB
      await SyllabusRepository.delete(req.params.id);
      return this.sendSuccess(res, {}, 'Syllabus deleted successfully');
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }
  }
}

module.exports = new SyllabusController();
