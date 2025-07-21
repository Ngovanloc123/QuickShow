import stripe from 'stripe';
import Booking from "../models/Booking.js";
import { inngest } from '../inngest/index.js';

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.error("Invalid webhook signature", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log("Received event:", event.type);

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;

                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id
                });

                const session = sessionList.data[0];
                if (!session || !session.metadata || !session.metadata.bookingId) {
                    console.error("Session or bookingId not found");
                    return res.status(400).send("Invalid session or bookingId");
                }

                const { bookingId } = session.metadata;

                await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: ""
                });

                // Send Confirmation Email
                await inngest.send({
                    name: 'app/show.booked',
                    data: {bookingId}
                })

                console.log(`Booking ${bookingId} marked as paid`);
                break;
            }

            default:
                console.log("Unhandled event type:", event.type);
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook processing error", err);
        res.status(500).send("Internal Server Error");
    }
};
