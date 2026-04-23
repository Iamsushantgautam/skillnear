import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Service',
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        date: {
            type: Date,
            required: true,
        },
        timeSlot: {
            type: String, // e.g., "10:00 AM - 12:00 PM"
            required: true,
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            googleMapLink: String,
            lat: Number,
            lng: Number,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "in_progress", "delivered", "completed", "revision_requested", "cancelled"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            required: true,
            default: 'cash_on_delivery',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        revisions: [{
            note: String,
            date: {
                type: Date,
                default: Date.now
            }
        }],
        deliveryProof: {
            type: String, // optional image or note from provider when delivering
        },
        paymentMode: {
            type: String, // "Cash" or "Online" (Captured at completion)
        }
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
