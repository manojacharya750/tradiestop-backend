import Review from '../models/Review.js';
import ClientReview from '../models/ClientReview.js';
import Notification from '../models/Notification.js';

// @desc    Add a new review for a tradie
// @route   POST /api/reviews
// @access  Private (Client only)
const addReview = async (req, res) => {
    const { bookingId, tradieId, tradieName, rating, comment } = req.body;
    const reviewer = req.user;

    if (reviewer.role !== 'Client') {
        return res.status(403).json({ message: 'Only clients can review tradies.' });
    }

    try {
        const newReview = new Review({
            _id: `r${new Date().getTime()}`,
            bookingId,
            reviewerId: reviewer.id,
            reviewerName: reviewer.name,
            reviewerImageUrl: reviewer.imageUrl,
            tradieId,
            tradieName,
            rating,
            comment,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        });

        const createdReview = await newReview.save();

        await Notification.create({
            userId: tradieId,
            message: `${reviewer.name} left you a ${rating}-star review!`,
            link: 'Reviews'
        });

        res.status(201).json(createdReview);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding review.' });
        console.error(error);
    }
};

// @desc    Add a new review for a client
// @route   POST /api/reviews/client
// @access  Private (Tradie only)
const addClientReview = async (req, res) => {
    const { bookingId, clientId, clientName, rating, comment } = req.body;
    const reviewer = req.user;

    if (reviewer.role !== 'Tradie') {
        return res.status(403).json({ message: 'Only tradies can review clients.' });
    }
     try {
        const newReview = new ClientReview({
            _id: `cr${new Date().getTime()}`,
            bookingId,
            reviewerId: reviewer.id,
            reviewerName: reviewer.name,
            reviewerImageUrl: reviewer.imageUrl,
            clientId,
            clientName,
            rating,
            comment,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        });

        const createdReview = await newReview.save();

        await Notification.create({
            userId: clientId,
            message: `${reviewer.name} left a review about their experience.`,
            link: 'Reviews'
        });

        res.status(201).json(createdReview);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding client review.' });
        console.error(error);
    }
};

export { addReview, addClientReview };