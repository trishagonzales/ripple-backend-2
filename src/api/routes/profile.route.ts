import express from 'express';
import { asyncWrap as a } from '../middlewares/asyncWrap';
import { auth } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate';
import { UserService } from '../../services/User.service';

const router = express.Router();

//  GET ALL PROFILES
router.get(
  '/profiles',
  a(async (_req, res) => {
    const profiles = await UserService.getAllProfiles();
    res.status(200).send(profiles);
  })
);

//  GET ONE PROFILE
router.get(
  '/profiles/:id',
  a(async (req, res) => {
    const profile = await UserService.getProfile(req.params.id);
    res.status(200).send(profile);
  })
);

//  UPDATE PROFILE
router.put(
  '/profiles/me',
  auth,
  a(async (req, res) => {
    const user = req.user;
    const validInput = validate(req.body, 'profile');
    const newProfile = await user.updateProfile(validInput);
    res.status(200).send(newProfile);
  })
);

export default router;
