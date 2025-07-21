import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
    // Chứa id của movie
    movie: {type: String, required: true, ref: 'Movie'},
    showDateTime: {type: Date, required: true},
    showPrice: {type: Number, required: true},
    /*
    Ghế đã có người ngồi
    "occupiedSeats": {
        "A1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        "B1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
        "C1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok"
    },
    */
    occupiedSeats: {type: Object, default: {}},
}, 
// Giúp Mongoose lưu dữ liệu rỗng
{minimize: false})

const Show = mongoose.model('Show', showSchema);

export default Show;