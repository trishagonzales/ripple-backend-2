import express from 'express';
import { asyncWrap as a } from '../middlewares/asyncWrap';
import { auth } from '../middlewares/auth.middleware';
import upload, { sendFileOptions } from '../middlewares/multer';
import { UserService } from '../../services/User.service';
import { PostService } from '../../services/Post.service';

const router = express.Router();

//  GET POST IMAGE
router.get(
  '/uploads/image/:id',
  a(async (req, res) => {
    const filename = await PostService.getImage(req.params.id);

    res.sendFile(filename, sendFileOptions, (err) => {
      if (err) throw err;
    });
  })
);

//  UPLOAD POST IMAGE
router.put(
  '/uploads/image/:id',
  auth,
  a(async (req, _res, next) => {
    const { params, user } = req;
    try {
      await PostService.validateImageUpload(params.id, user.id);
      next();
    } catch (e) {
      next(e);
    }
  }),
  upload.single('image'),
  a(async (req, res) => {
    const { file, params } = req;
    const filename = await PostService.uploadImage(file.filename, params.id);

    res.status(200).send(filename);
  })
);

//  GET USER'S AVATAR / PROFILE PICTURE
router.get(
  '/uploads/avatar/:id',
  a(async (req, res) => {
    const filename = await UserService.getAvatar(req.params.id);

    res.sendFile(filename, sendFileOptions, (err) => {
      if (err) throw err;
    });
  })
);

//  UPLOAD USER'S AVATAR / PROFILE PICTURE
router.put(
  '/uploads/avatar',
  auth,
  a((req, res, next) => {
    const uploadSingle = upload.single('avatar');
    uploadSingle(req, res, async (err: any) => {
      if (err) next(err);

      const { file, user } = req;
      await user.uploadAvatar(file.filename);

      res.status(200).send(file.filename);
    });
  })
);

export default router;
