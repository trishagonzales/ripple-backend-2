import UserModel, { UserDocument } from '../models/user.model';
import { HttpError } from '../utils/errorHandler';
import { UserService } from './User.service';
import { Mail } from '../utils/Mail';

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  firstName: string;
  lastName: string;
}

export class AuthService {
  //  SIGNUP
  public static async signup({ firstName, lastName, email, password }: SignupInput) {
    const user = await UserModel.findOne({ email });
    if (user) throw new HttpError('User already registered', 400);

    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password: await UserModel.hashPassword(password),
    });
    await newUser.save();

    return this.newUserSession(newUser);
  }

  //  LOGIN
  public static async login({ email, password }: LoginInput) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new HttpError('Invalid email or password', 400);

    const isPassValid = await user.validatePassword(password);
    if (!isPassValid) throw new HttpError('Invalid email or password', 400);

    return this.newUserSession(user);
  }

  //  ATTACH USER
  public static async attachUser(id: string) {
    const user = await UserModel.findById(id);
    if (!user) throw new HttpError('No user found', 404);

    return new UserService(id);
  }

  //  NEW USER SESSION
  private static async newUserSession(user: UserDocument) {
    return {
      token: user.generateToken(),
      user: new UserService(user._id),
    };
  }

  //  SEND FORGOT PASSWORD LINK
  public static async sendForgotPasswordLink(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new HttpError('No user found', 404);

    const mail = new Mail(email);
    mail.createConfirmationHtml(user._id, 'Click the button below to reset your password.', 'forgot-password');
    await mail.send('Reset password request');
  }
}
