import Document from '../models/Document.js';

const toDocumentResponse = (document) => ({
  documentId: document._id,
  title: document.title,
  description: document.description,
  ownerId: document.ownerId,
  creationDate: document.creationDate ?? document.createdAt,
  lastUpdatedDate: document.lastUpdatedDate ?? document.updatedAt
});

const toLastVisitedResponse = (lastVisitedDocument) => {
  if (!lastVisitedDocument) {
    return null;
  }

  return {
    documentId: lastVisitedDocument.documentId,
    title: lastVisitedDocument.title,
    reviewedAt: lastVisitedDocument.reviewedAt
  };
};

export const createDocument = async (req, res) => {
  try {
    const { title, description } = req.body;
    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    const normalizedDescription =
      typeof description === 'string' ? description.trim() : '';

    if (!normalizedTitle || !normalizedDescription) {
      return res.status(400).json({
        message: 'Title and description are required'
      });
    }

    const document = await Document.create({
      title: normalizedTitle,
      description: normalizedDescription,
      ownerId: req.session.userId
    });

    return res.status(201).json({
      message: 'Document created successfully',
      document: toDocumentResponse(document)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating document',
      error: error.message
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      ownerId: req.session.userId
    }).sort({ creationDate: -1, createdAt: -1 });

    return res.status(200).json(
      documents.map((doc) => toDocumentResponse(doc))
    );
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving documents',
      error: error.message
    });
  }
};

export const getLastVisitedDocument = async (req, res) => {
  return res.status(200).json({
    lastVisitedDocument: toLastVisitedResponse(req.session.lastVisitedDocument)
  });
};

export const getDocumentById = async (req, res) => {
  req.session.lastVisitedDocument = {
    documentId: req.document._id.toString(),
    title: req.document.title,
    reviewedAt: new Date().toISOString()
  };

  return res.status(200).json(toDocumentResponse(req.document));
};

export const updateDocument = async (req, res) => {
  try {
    const document = req.document;
    const { title, description } = req.body;

    if (title === undefined && description === undefined) {
      return res.status(400).json({
        message: 'Title or description is required for update'
      });
    }

    if (title !== undefined) {
      const normalizedTitle = typeof title === 'string' ? title.trim() : '';

      if (!normalizedTitle) {
        return res.status(400).json({
          message: 'Title cannot be empty'
        });
      }

      document.title = normalizedTitle;
    }

    if (description !== undefined) {
      const normalizedDescription =
        typeof description === 'string' ? description.trim() : '';

      if (!normalizedDescription) {
        return res.status(400).json({
          message: 'Description cannot be empty'
        });
      }

      document.description = normalizedDescription;
    }

    await document.save();

    return res.status(200).json({
      message: 'Document updated successfully',
      document: toDocumentResponse(document)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating document',
      error: error.message
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    await req.document.deleteOne();

    return res.status(200).json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting document',
      error: error.message
    });
  }
};