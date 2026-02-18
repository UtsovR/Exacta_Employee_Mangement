const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { supabaseAdmin } = require('../lib/supabase');

const getPrismaUserFromSupabaseUser = async (supabaseUser) => {
    const email = supabaseUser?.email || null;
    const metadata = supabaseUser?.user_metadata || {};
    const fallbackEmpId =
        metadata.empId ||
        metadata.employeeId ||
        metadata.emp_id ||
        null;

    if (email) {
        const userByEmail = await prisma.user.findUnique({
            where: { email },
            select: { id: true, empId: true, role: true, name: true, email: true, team: true },
        });

        if (userByEmail) {
            return userByEmail;
        }
    }

    if (fallbackEmpId) {
        return prisma.user.findUnique({
            where: { empId: fallbackEmpId },
            select: { id: true, empId: true, role: true, name: true, email: true, team: true },
        });
    }

    return null;
};

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
    } catch (_legacyJwtError) {
        try {
            const { data, error } = await supabaseAdmin.auth.getUser(token);
            if (error || !data?.user) {
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }

            const mappedUser = await getPrismaUserFromSupabaseUser(data.user);
            if (!mappedUser) {
                return res.status(401).json({
                    message: 'Not authorized, no matching local user for this Supabase account',
                });
            }

            req.user = {
                id: mappedUser.id,
                empId: mappedUser.empId,
                role: mappedUser.role,
                name: mappedUser.name,
                email: mappedUser.email,
                team: mappedUser.team,
                authProvider: 'supabase',
            };

            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }

    return res.status(403).json({ message: 'Not authorized as an admin' });
};
