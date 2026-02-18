const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { empId, password } = req.body;
    console.log(`[Auth] Login attempt for empId: ${empId}`);

    try {
        const user = await prisma.user.findUnique({
            where: { empId },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is inactive' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, empId: user.empId, role: user.role, name: user.name, team: user.team },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                empId: user.empId,
                name: user.name,
                email: user.email,
                role: user.role,
                team: user.team,
                joiningDate: user.joiningDate,
                dob: user.dob,
                bloodGroup: user.bloodGroup,
                profilePhoto: user.profilePhoto,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                empId: true,
                name: true,
                email: true,
                role: true,
                team: true,
                joiningDate: true,
                dob: true,
                bloodGroup: true,
                profilePhoto: true,
            }
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update current user profile (Photo only for now)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    const { profilePhoto } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { profilePhoto },
            select: {
                id: true,
                empId: true,
                name: true,
                email: true,
                role: true,
                team: true,
                joiningDate: true,
                dob: true,
                bloodGroup: true,
                profilePhoto: true,
            }
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
