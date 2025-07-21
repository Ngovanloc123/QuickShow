import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import stripe from 'stripe'


// Hàm kiểm tra chỗ ngồi được chọn có hợp lệ không
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId)
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]) 

        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const {userId} = req.auth();
        console.log(userId);
        
        const {showId, selectedSeats} = req.body;
        const {origin} = req.headers;

        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)

        if(!isAvailable) {
            return res.json({success: false, message: "Selected Seats are not available."})
        }

        // Get the show Details
        const showData = await Show.findById(showId).populate('movie');

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats,
        })

        selectedSeats.map((seat) => {
            showData.occupiedSeats[seat] = userId;
        })
        // Đánh dấu trường occupiedSeats đã bị thay đổi, để Mongoose biết cần lưu lại khi gọi save()
        showData.markModified('occupiedSeats');
        await showData.save();

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/loading/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
        })

        booking.paymentLink = session.url // URL trang thanh toán của Stripe
        await booking.save()

        // Run Inngest Scheduler Function 
        await inngest.send({
            name: 'app/checkpayment',
            data: {
                bookingId: booking._id.toString()
            }
        })

        res.json({success: true, url: session.url})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);

        const occupiedSeats = Object.keys(showData.occupiedSeats);

        res.json({ success: true, occupiedSeats });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
