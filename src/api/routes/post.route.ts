import express, { Request } from 'express';
import { asyncWrap as a } from '../middlewares/asyncWrap';
import { auth } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate';
import { PostService } from '../../services/Post.service';
// import { logger } from '../../utils/logger';

// const log = logger.extend('post-route');

const router = express.Router();

//  GET ALL POSTS
router.get(
  '/posts',
  a(async (_req, res) => {
    const posts = await PostService.getAllPosts();
    return res.status(200).send(posts);
  })
);

//  GET LIKED POSTS
router.get(
  '/posts/liked',
  auth,
  a(async (req: Request, res) => {
    const { user } = req;
    const posts = await PostService.getLikedPosts(user.id);

    res.status(200).send(posts);
  })
);

//  GET ONE POST
router.get(
  '/posts/:id',
  a(async (req, res) => {
    const post = await PostService.getOnePost(req.params.id);
    res.status(200).send(post);
  })
);

//  GET ALL POSTS FROM A SINGLE USER
router.get(
  '/posts/user/:id',
  a(async (req, res) => {
    const userId = req.params.id;
    const posts = await PostService.getUserPosts(userId);
    return res.status(200).send(posts);
  })
);

//  CREATE NEW POST
router.post(
  '/posts',
  auth,
  a(async (req: Request, res) => {
    const validInput = validate(req.body, 'post');
    const post = await PostService.createNewPost(validInput, req.user.id);

    res.status(201).send(post);
  })
);

//  UPDATE POST
router.put(
  '/posts/:id',
  auth,
  a(async (req: Request, res) => {
    const validInput = validate(req.body, 'post');
    const { params, user } = req;
    const post = await PostService.updatePost(validInput, params.id, user.id);

    res.status(200).send(post);
  })
);

//  DELETE POST
router.delete(
  '/posts/:id',
  auth,
  a(async (req, res) => {
    const post = await PostService.deletePost(req.params.id);

    res.status(200).send(post);
  })
);

//  LIKE A POST
router.put(
  '/posts/:id/like',
  auth,
  a(async (req: Request, res) => {
    const user = req.user;
    await user.likePost(req.params.id);

    res.status(200).send('Successfully liked post');
  })
);

//  UNLIKE A POST
router.put(
  '/posts/:id/unlike',
  auth,
  a(async (req: Request, res) => {
    const user = req.user;
    await user.unlikePost(req.params.id);

    res.status(200).send('Successfully unliked post');
  })
);

export default router;
