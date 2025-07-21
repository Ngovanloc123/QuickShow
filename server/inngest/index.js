import { Inngest } from "inngest";
import User from "../models/User.js"
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Tạo một ứng dụng khách để gửi và nhận sự kiện
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event})=> {
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData)
    }
)

// Inngest Function to delete user data to a database
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    {event: 'clerk/user.delete'},
    async ({event})=> {
        const {id} = event.data
        await User.findByIdAndDelete(id)
    }
)

// Inngest Function to update user data to a database
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event})=> {
        const {id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData)
    }
)
// Xóa booking và seats của show sau 10 phút không thanh toán
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {id: 'release-seats-delete-booking'},
    {even: "app/checkpayment"},
    async ({ even, step }) => {
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

        await step.run('check-payment-status', async () => {
            const bookingId = even.data.bookingId;
            const booking = await Booking.findById(bookingId)

            // If payment is not made, release seats and delete booking
            if(!booking.isPaid) {
                const show = await Show.findById(booking.show)
                booking.bookedSeats.forEach((seat) => {
                    delete show.occupiedSeats[seat]
                });
                show.markModified('occupiedSeats')
                await show.save()
                await Booking.findByIdAndDelete(booking._id)
            }
        })
    }
)

// Tạo một mảng trống nơi chúng ta sẽ xuất các hàm Inngest trong tương lai
export const functions = [
    syncUserCreation, 
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking
];