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
        console.error("Error parsing form:", err);
        return reject(err);
      }

      // console.log("Fields:", fields);
      console.log("Files:", files);

      // Process the uploaded files here
      const processedFiles: { [key: string]: any } = {};
      Object.keys(files).forEach((key) => {
        const fileArray = files[key];
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file: File) => {
            console.log("Processing file:", file);
            const data = fs.readFileSync(file.filepath);
            const uploadDir = path.join(process.cwd(), 'public', 'upload');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, file.originalFilename as string);
            fs.writeFileSync(filePath, data);
            fs.unlinkSync(file.filepath);
            processedFiles[key] = {
              originalFilename: file.originalFilename,
              filePath: `/upload/${file.originalFilename}`,
            };
          });
        }
      });

      console.log("Processed Files:", processedFiles);

      // Resolve with the fields and processed file paths
      resolve({ fields, files: processedFiles });
    });
  });
}