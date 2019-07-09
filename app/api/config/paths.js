const { UPLOADS_FOLDER, CUSTOM_UPLOADS_FOLDER } = process.env;

const uploadDocumentsPath = UPLOADS_FOLDER || `${__dirname}/../../../uploaded_documents/`;
const attachmentsPath = UPLOADS_FOLDER || `${__dirname}/../../../uploaded_documents/`;
const customUploadsPath = CUSTOM_UPLOADS_FOLDER || `${__dirname}/../../../custom_uploads/`;

export default {
  uploadDocumentsPath,
  attachmentsPath,
  customUploadsPath,
};
