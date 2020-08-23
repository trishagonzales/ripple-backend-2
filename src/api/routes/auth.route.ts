import express from 'express';
import { asyncWrap as a } from '../middlewares/asyncWrap';
import { AuthService, LoginInput } from '../../services/Auth.service';
import validate from '../middlewares/validate';

const router = express.Router();

//  LOGIN
router.post(
  '/auth',
  a(async (req, res) => {
    const validInput = validate<LoginInput>(req.body, 'login');
    const { user, token } = await AuthService.login(validInput);
    const userData = await user.getAccountData();

    res.status(200).header('x-auth-token', token).send(userData);
  })
);

//  FORGOT PASSWORD
router.post(
  '/auth/forgot-password',
  a(async (req, res) => {
    const validInput = validate(req.body.email, 'email');
    await AuthService.sendForgotPasswordLink(validInput);
    res.status(200).send('Check your email for link to reset password');
  })
);

export default router;
