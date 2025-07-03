import Booking from '../models/Booking.js';
import Tradie from '../models/Tradie.js';
import Notification from '../models/Notification.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Client only)
const createBooking = async (req, res) => {
    const { tradieId, serviceDate, details } = req.body;
    const client = req.user;

    if (client.role !== 'Client') {
        return res.status(403).json({ message: 'Only clients can create bookings.' });
    }

    try {
        const tradie = await Tradie.findOne({ id: tradieId });
        if (!tradie) {
            return res.status(404).json({ message: 'Tradie not found.' });
        }

        const newBooking = new Booking({
            _id: `b${new Date().getTime()}`,
            clientId: client.id,
            clientName: client.name,
            clientImageUrl: client.imageUrl,
            tradieId: tradie.id,
            tradieName: tradie.name,
            tradieProfession: tradie.profession,
            tradieImageUrl: tradie.imageUrl,
            serviceDate,
            details,
            status: 'Requested',
        });

        const createdBooking = await newBooking.save();

        // Create notification for the tradie
        await Notification.create({
            userId: tradie.id,
            message: `You have a new booking request from ${client.name}.`,
            link: 'Bookings',
        });

        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating booking.' });
        console.error(error);
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Tradie or Client)
const updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    const { id: bookingId } = req.params;
    const user = req.user;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Authorization check
        if (user.role === 'Tradie' && user.id !== booking.tradieId) {
            return res.status(403).json({ message: 'Not authorized to update this booking.' });
        }
         if (user.role === 'Client' && user.id !== booking.clientId) {
            return res.status(403).json({ message: 'Not authorized to update this booking.' });
        }

        booking.status = status;
        const updatedBooking = await booking.save();
        
        // Notify the other party
        const notifyUserId = user.role === 'Tradie' ? booking.clientId : booking.tradieId;
        const message = user.role === 'Tradie' 
            ? `Your booking for "${booking.details.substring(0, 20)}..." has been ${status.toLowerCase()}.`
            : `${user.name} has cancelled the booking for "${booking.details.substring(0, 20)}...".`;

        await Notification.create({
            userId: notifyUserId,
            message,
            link: 'Bookings'
        });

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating booking status.' });
        console.error(error);
    }
};

// @desc    Reschedule a booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private (Client only)
const rescheduleBooking = async (req, res) => {
    const { newDate } = req.body;
    const { id: bookingId } = req.params;
    const client = req.user;
    
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        if (client.id !== booking.clientId) {
            return res.status(403).json({ message: 'Only the client can reschedule.' });
        }

        booking.serviceDate = newDate;
        const updatedBooking = await booking.save();
        
        // Notify the tradie
         await Notification.create({
            userId: booking.tradieId,
            message: `${client.name} has requested to reschedule a booking to ${newDate}.`,
            link: 'Bookings'
        });

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: 'Server error rescheduling booking.' });
        console.error(error);
    }
};

export { createBooking, updateBookingStatus, rescheduleBooking };