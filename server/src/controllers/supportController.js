const prisma = require('../prisma');

exports.createTicket = async (req, res) => {
    try {
        const { subject, message, priority } = req.body;
        const ticket = await prisma.supportTicket.create({
            data: {
                userId: req.user.id,
                subject,
                message,
                priority: priority || 'NORMAL'
            }
        });

        // Optional: Create a notification for the user that ticket was received
        await prisma.notification.create({
            data: {
                userId: req.user.id,
                title: 'Ticket Received',
                message: `Your ticket "${subject}" has been received. Our team will look into it.`,
                type: 'INFO'
            }
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
