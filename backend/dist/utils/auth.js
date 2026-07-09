import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '30d'),
    });
};
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};
export const comparePassword = async (enteredPassword, hash) => {
    return bcrypt.compare(enteredPassword, hash);
};
