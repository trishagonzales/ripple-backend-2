import multer from 'multer';

const storage = multer.diskStorage({
  destination: process.cwd() + '/tmp',
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

export const sendFileOptions = {
  root: process.cwd() + '/tmp',
};

export default upload;
