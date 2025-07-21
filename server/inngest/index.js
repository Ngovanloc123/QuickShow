import { Inngest } from "inngest";
import User from "../models/User.js"
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodemailer.js";

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
    {event: 'clerk/user.deleted'}, // Sửa từ 'clerk/user.delete' thành 'clerk/user.deleted'
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
    {event: "app/checkpayment"},
    async ({ event, step }) => {
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

        await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            // Kiểm tra nếu booking tồn tại
            if (!booking) {
                console.log(`Booking with ID ${bookingId} not found`);
                return;
            }

            // If payment is not made, release seats and delete booking
            if(!booking.isPaid) {
                const show = await Show.findById(booking.show)
                
                if (show) {
                    booking.bookedSeats.forEach((seat) => {
                        delete show.occupiedSeats[seat]
                    });
                    show.markModified('occupiedSeats')
                    await show.save()
                }
                
                await Booking.findByIdAndDelete(booking._id)
                console.log(`Booking ${bookingId} deleted due to unpaid status`);
            } else {
                console.log(`Booking ${bookingId} is already paid`);
            }
        })
    }
)

// Inngest Function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
  {id: 'send-booking-confirmation-email'},
  {event: 'app/show.booked'},
  async ({event, step}) => {
    const {bookingId } = event.data
    const booking = await Booking.findById(bookingId).populate({
      path: 'show',
      populate: {path: 'movie', model: 'movie'}
    }).populate('user');

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hi ${booking.user.name},</h2>
          <p>Your booking for 
            <strong style="color: #F84565;">
              ${booking.show.movie.title}
            </strong> 
            is confirmed.
          </p>
          <p>
            <strong>Date:</strong> 
            ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br/>
            <strong>Time:</strong> 
            ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
          </p>
          <p>Enjoy the show! 🍿</p>
          <p>Thanks for booking with us!<br/>– QuickShow Team</p>
        </div>`
    })
  }
)

// Tạo một mảng trống nơi chúng ta sẽ xuất các hàm Inngest trong tương lai
export const functions = [
    syncUserCreation, 
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail
];