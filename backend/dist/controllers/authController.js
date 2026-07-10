import { User } from '../models/User.js';
import { generateToken, hashPassword, comparePassword } from '../utils/auth.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
export const registerUser = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { firstName, lastName, email, phone, password, role } = validatedData;
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
                    token: generateToken(user._id),
                },
            });
        }
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(400).json({ success: false, message: error.message });
    }
};
export const loginUser = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { identity, password, role } = validatedData; // identity can be email or phone
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
                    token: generateToken(user._id),
                },
            });
        }
        else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(401).json({ success: false, message: error.message });
    }
};
