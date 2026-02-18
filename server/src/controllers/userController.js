const prisma = require('../prisma');
const bcrypt = require('bcryptjs');

// @desc    Create a new employee
// @route   POST /api/users
// @access  Admin
exports.createEmployee = async (req, res) => {
    const { empId, password, name, team, role, joiningDate, dob, bloodGroup } = req.body;

    try {
        if (!empId || !name || !password) {
            return res.status(400).json({ message: 'empId, name and password are required' });
        }

        const userExists = await prisma.user.findUnique({
            where: { empId },
        });

        if (userExists) {
            return res.status(400).json({ message: `Employee ID "${empId}" already exists` });
        }

        const normalizedRole = role || 'EMPLOYEE';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                empId,
                password: hashedPassword,
                name,
                role: normalizedRole,
                team: normalizedRole === 'ADMIN' ? null : (team || 'DEVELOPMENT'),
                joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
                dob: dob ? new Date(dob) : null,
                bloodGroup: bloodGroup || null,
                currentStatus: 'WORKING',
                isActive: true
            },
        });

        res.status(201).json({
            id: user.id,
            empId: user.empId,
            name: user.name,
            team: user.team,
            role: user.role,
            joiningDate: user.joiningDate,
            dob: user.dob,
            bloodGroup: user.bloodGroup
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all employees
// @route   GET /api/users
// @access  Admin
exports.getEmployees = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                empId: true,
                name: true,
                role: true,
                team: true,
                isActive: true,
                currentStatus: true,
                breakLogs: {
                    where: { status: 'ACTIVE' },
                    select: { startTime: true },
                    take: 1
                }
            },
        });
        // Flatten the structure for easier frontend consumption
        const usersWithStatus = users.map(user => ({
            ...user,
            breakStartTime: user.breakLogs[0]?.startTime || null
        }));
        res.json(usersWithStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update employee
// @route   PUT /api/users/:id
// @access  Admin
exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { name, email, team, role, isActive, password, joiningDate, dob, bloodGroup, profilePhoto } = req.body;

    try {
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (team) updateData.team = team;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (joiningDate) updateData.joiningDate = new Date(joiningDate);
        if (dob) updateData.dob = new Date(dob);
        if (bloodGroup) updateData.bloodGroup = bloodGroup;
        if (profilePhoto) updateData.profilePhoto = profilePhoto;

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (role === 'ADMIN') {
            updateData.team = null;
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                empId: true,
                name: true,
                email: true,
                role: true,
                team: true,
                isActive: true,
                joiningDate: true,
                dob: true,
                bloodGroup: true,
                profilePhoto: true,
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
