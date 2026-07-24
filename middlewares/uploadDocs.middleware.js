import multer from 'multer';

// Almacenamos los archivos en memoria para subirlos a Supabase Storage
const storage = multer.memoryStorage();

const uploadDocs = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB por archivo
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten imágenes (JPG, PNG, WEBP) y documentos (PDF, DOC, DOCX).`), false);
    }
  }
});

export const profileUploadFields = uploadDocs.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'curriculum', maxCount: 1 },
  { name: 'titulo', maxCount: 1 },
  { name: 'maestria', maxCount: 1 },
  { name: 'capacitacion', maxCount: 1 },
  { name: 'carta1', maxCount: 1 },
  { name: 'carta2', maxCount: 1 },
  { name: 'carta3', maxCount: 1 },
  { name: 'proforma', maxCount: 1 },
  { name: 'foto', maxCount: 1 }
]);

export default uploadDocs;
