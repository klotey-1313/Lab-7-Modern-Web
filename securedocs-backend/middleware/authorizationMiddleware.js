import mongoose from 'mongoose';
import Document from '../models/Document.js';

export const requireDocumentOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid document identifier'
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }

    if (document.ownerId.toString() !== req.session.userId) {
      return res.status(403).json({
        message: 'Access denied: you are not allowed to access this document'
      });
    }

    req.document = document;
    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Authorization check failed',
      error: error.message
    });
  }
};