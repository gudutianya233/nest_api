import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dir = `./public/${req.params.dir}/${year}-${month}-${day}`;
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
};
