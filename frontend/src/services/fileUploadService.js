import { API_CONFIG } from '../config/api';

class FileUploadService {
  static async uploadFile(file, documentType) {
    // Demo implementation
    return Promise.resolve({
      success: true,
      filePath: 'demo/path/' + file.name,
      publicUrl: 'https://example.com/demo/' + file.name
    });
  }
}

export default FileUploadService;
