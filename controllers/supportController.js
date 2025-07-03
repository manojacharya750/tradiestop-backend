import SupportTicket from '../models/SupportTicket.js';

// @desc    Create a new support ticket
// @route   POST /api/support
// @access  Private
const createSupportTicket = async (req, res) => {
    const { subject, description } = req.body;
    const user = req.user;

    try {
        const newTicket = new SupportTicket({
            _id: `t${new Date().getTime()}`,
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            subject,
            description,
            status: 'Open',
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        });
        const createdTicket = await newTicket.save();
        res.status(201).json(createdTicket);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating support ticket.' });
        console.error(error);
    }
};

// @desc    Update support ticket status
// @route   PUT /api/support/:id/status
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
    const { status } = req.body;
    
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        ticket.status = status;
        const updatedTicket = await ticket.save();
        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating ticket status.' });
        console.error(error);
    }
};


export { createSupportTicket, updateTicketStatus };