import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { generateToken, hashPassword, comparePassword } from '../utils/auth.js';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email or phone already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'BUYER',
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          token: generateToken(user._id as any),
        },
      });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identity, password, role } = req.body; // identity can be email or phone

    const user = await User.findOne({ $or: [{ email: identity }, { phone: identity }] });

    if (user && user.password && (await comparePassword(password, user.password))) {
      if (role && user.role !== role) {
        res.status(403);
        throw new Error(`Invalid role. You are registered as a ${user.role}.`);
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          token: generateToken(user._id as any),
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};
