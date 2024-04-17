// src/pages/api/upload.ts
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest } from 'next';

export default function uploadFormFiles(req: NextApiRequest) {
  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      // Process the uploaded files here
      Object.values(files).forEach((fileArray: File[] | undefined) => {
        if (fileArray) {
          fileArray.forEach((file: File) => {
            const data = fs.readFileSync(file.filepath);
            const uploadDir = path.join(process.cwd(), 'public', 'upload');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, file.originalFilename as string);
            fs.writeFileSync(filePath, data);
            fs.unlinkSync(file.filepath);
          });
        }
      });

      // Resolve with the fields and files
      resolve({ fields, files });
    });
  });
}