import User from '../models/User.js';
import Tradie from '../models/Tradie.js';
import Booking from '../models/Booking.js';
import Message from '../models/Message.js';
import Invoice from '../models/Invoice.js';
import Review from '../models/Review.js';
import ClientReview from '../models/ClientReview.js';
import SupportTicket from '../models/SupportTicket.js';
import Notification from '../models/Notification.js';

// @desc    Fetch all data for a given user role
// @route   GET /api/data/all
// @access  Private
const getAllData = async (req, res) => {
    try {
        const { id, role } = req.user;
        
        let bookingsQuery = {};
        let invoicesQuery = {};
        let reviewsQuery = {};
        let clientReviewsQuery = {};
        let supportTicketsQuery = {};
        let usersQuery = {};
        let tradiesQuery = {};

        if (role === 'Client') {
            bookingsQuery = { clientId: id };
            invoicesQuery = { 'client.id': id };
            reviewsQuery = { reviewerId: id };
            clientReviewsQuery = { clientId: id };
            supportTicketsQuery = { userId: id };
            usersQuery = { id };
            tradiesQuery = {}; // Clients need to see all tradies
        } else if (role === 'Tradie') {
            bookingsQuery = { tradieId: id };
            invoicesQuery = { 'tradie.id': id };
            reviewsQuery = { tradieId: id };
            clientReviewsQuery = { reviewerId: id };
            supportTicketsQuery = { userId: id };
            usersQuery = { id };
            tradiesQuery = { id }; // Tradies only see themselves
        }
        // Admins see all, so empty query {} is fine. For users, we send all for now.
        if(role === 'Admin') {
            usersQuery = {};
            tradiesQuery = {};
        }

        const users = await User.find(usersQuery).select('-password');
        const tradies = await Tradie.find(tradiesQuery).populate('companyDetails');
        
        const dataPayload = {
            users,
            tradies,
            bookings: await Booking.find(bookingsQuery),
            messages: await Message.find({}), // Messages are mock for now
            invoices: await Invoice.find(invoicesQuery).populate('tradie.companyDetails'),
            reviews: await Review.find(reviewsQuery),
            clientReviews: await ClientReview.find(clientReviewsQuery),
            supportTickets: await SupportTicket.find(supportTicketsQuery),
        };
        
        if (role === 'Client' && tradies.length === 0) {
            dataPayload.tradies = await Tradie.find({}).populate('companyDetails');
        }
         if (role === 'Admin' && users.length === 0) {
            dataPayload.users = await User.find({}).select('-password');
        }
        if (role === 'Admin') {
            dataPayload.supportTickets = await SupportTicket.find({});
        }

        res.json(dataPayload);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not fetch data' });
        console.error(error);
    }
};

// @desc    Fetch notifications for the logged-in user
// @route   GET /api/data/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not fetch notifications' });
        console.error(error);
    }
};

// @desc    Mark notifications as read
// @route   PUT /api/data/notifications/read
// @access  Private
const markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, read: false }, { $set: { read: true } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not update notifications' });
        console.error(error);
    }
};


export { getAllData, getNotifications, markNotificationsRead };