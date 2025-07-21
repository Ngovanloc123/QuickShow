import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Tạo một client Inngest
export const inngest = new Inngest({ id: "movie-ticket-booking" });

/**
 * Đồng bộ tạo user từ Clerk
 */
const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-from-clerk",
        trigger: { event: "clerk/user.created" },
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } =
            event.data;

        const userData = {
            _id: id,
            email: email_addresses?.[0]?.email_address || "",
            name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
            image: image_url || "",
        };

        await User.create(userData);
    }
);

/**
 * Đồng bộ xóa user từ Clerk
 */
const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-with-clerk",
        trigger: { event: "clerk/user.deleted" },
    },
    async ({ event }) => {
        const { id } = event.data;
        await User.findByIdAndDelete(id);
    }
);

/**
 * Đồng bộ cập nhật user từ Clerk
 */
const syncUserUpdation = inngest.createFunction(
    {
        id: "update-user-from-clerk",
        trigger: { event: "clerk/user.updated" },
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } =
            event.data;

        const userData = {
            _id: id,
            email: email_addresses?.[0]?.email_address || "",
            name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
            image: image_url || "",
        };

        await User.findByIdAndUpdate(id, userData);
    }
);

/**
 * Giải phóng ghế và hủy booking nếu sau 10 phút chưa thanh toán
 */
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {
        id: "release-seats-delete-booking",
        trigger: { event: "app/checkpayment" },
    },
    async ({ event, step }) => {
        // Chờ 10 phút
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil("wait-10-minutes", tenMinutesLater);

        // Kiểm tra lại trạng thái thanh toán
        await step.run("check-payment-status", async () => {
            const { bookingId } = event.data;
            const booking = await Booking.findById(bookingId);

            if (booking && !booking.isPaid) {
                const show = await Show.findById(booking.show);
                if (show) {
                    booking.bookedSeats.forEach((seat) => {
                        delete show.occupiedSeats[seat];
                    });
                    show.markModified("occupiedSeats");
                    await show.save();
                }

                await Booking.findByIdAndDelete(booking._id);
            }
        });
    }
);

// Export tất cả các function
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
];
