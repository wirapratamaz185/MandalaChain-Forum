import { Request, Response } from "express";
import Formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function uploadFormFiles(
  req: Request,
  res: Response
) {
  return new Promise(async (resolve, reject) => {
    const form = new Formidable.IncomingForm({
      multiples: true,
      keepExtensions: true,
    });

    form
    .on("file", (_name: string, file: Formidable.File) => {
      const data = fs.readFileSync((file as any).path);
        fs.writeFileSync(`public/upload/${(file as any).name}`, data);
        fs.unlinkSync((file as any).path);
      })
      .on("aborted", () => {
        reject(res.status(500).send('Aborted'))  
      })
      .on("end", () => {
        resolve(res.status(200).send('done'));
      });

    await form.parse(req)
  });
}