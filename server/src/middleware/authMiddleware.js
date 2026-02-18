const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

exports.protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.empId && decoded.id) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { empId: true },
            });
            if (user?.empId) {
                decoded.empId = user.empId;
            }
        }
        req.user = decoded;
        return next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }

    return res.status(403).json({ message: 'Not authorized as an admin' });
};
