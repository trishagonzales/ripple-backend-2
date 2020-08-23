import express, { Request } from 'express';
import jwt from 'jsonwebtoken';
import { asyncWrap as a } from '../middlewares/asyncWrap';
import { auth } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate';
import { AuthService, SignupInput } from '../../services/Auth.service';
import { config } from '../../utils/config';
import { HttpError } from '../../utils/errorHandler';

const router = express.Router();

//  CREATE NEW USER
router.post(
  '/users',
  a(async (req, res) => {
    const validInput = validate<SignupInput>(req.body, 'signup');
    const { user, token } = await AuthService.signup(validInput);
    await user.sendValidateEmailLink();
    const userData = await user.getAccountData();
    res.status(201).header('x-auth-token', token).send(userData);
  })
);

//  GET USER DATA
router.get(
  '/users/me',
  auth,
  a(async (req, res) => {
    const user = req.user;
    const userData = await user.getAccountData();
    res.status(200).send(userData);
  })
);

//  RESEND VALIDATE EMAIL LINK
router.get(
  '/users/resend-validate-email-link',
  auth,
  a(async (req, res) => {
    const user = req.user;
    await user.sendValidateEmailLink();
    res.status(200).send('Successfully sent validation link');
  })
);

//  VALIDATE EMAIL
router.get(
  '/users/email/validate/:token',
  a(async (req: Request<{ token?: any }>, res, next) => {
    const token = req.params.token;

    jwt.verify(token, config.JWT_KEY as string, {}, async (err: any, decoded: any) => {
      try {
        if (err) throw new HttpError('Invalid token', 400);
        const user = await AuthService.attachUser(decoded.userId);
        await user.validateEmail();
        res.status(200).send('Successfully validated email');
      } catch (e) {
        next(e);
      }
    });
  })
);

//  VALIDATE PASSWORD
router.post(
  '/users/password/validate',
  auth,
  a(async (req, res) => {
    const validInput = validate<string>(req.body.password, 'password');
    const user = req.user;
    await user.validatePassword(validInput);
    res.status(200).send('Password is valid.');
  })
);

// RESET PASSWORD
router.put(
  '/users/password/reset/:token',
  a(async (req: Request<{ token?: any }>, res) => {
    const validInput = validate(req.body.password, 'password');
    const token = req.params.token;

    jwt.verify(token, config.JWT_KEY as string, {}, async (err: any, decoded: any) => {
      if (err) throw new HttpError('Invalid token', 400);
      const user = await AuthService.attachUser(decoded.userId);
      await user.updatePassword(validInput);
      res.status(200).send('Successfully changed password. Login with your new credentials.');
    });
  })
);

//  UPDATE EMAIL
router.put(
  '/users/email',
  auth,
  a(async (req, res) => {
    const validInput = validate<string>(req.body.email, 'email');
    const user = req.user;
    const email = await user.updateEmail(validInput);
    res.status(200).send({ email });
  })
);

//  UPDATE PASSWORD
router.put(
  '/users/password',
  auth,
  a(async (req, res) => {
    const validInput = validate<string>(req.body.password, 'password');
    const user = req.user;
    await user.updatePassword(validInput);
    res.status(200).send('Successfully updated password.');
  })
);

//  DELETE USER
router.delete(
  '/users/me',
  auth,
  a(async (req, res) => {
    const user = req.user;
    await user.deleteAccount();
    res.status(200).send('Successfully deleted user.');
  })
);

export default router;
