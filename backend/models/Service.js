import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        subCategory: {
            type: String,
        },
        businessType: {
            type: String,
            enum: ['service', 'shop'],
            default: 'service'
        },
        description: {
            type: String,
            required: true,
        },
        // Single price field (used if plans are not provided)
        price: {
            type: Number,
        },
        priceType: {
            type: String,
            enum: ['hourly', 'fixed', 'starting_at'],
            default: 'fixed',
        },
        // Multi-tier plans (Basic, Standard, Premium)
        plans: [
            {
                name: String, // e.g., Basic
                price: Number,
                description: String,
                features: [String],
                deliveryTime: String // e.g. "2 days"
            }
        ],
        images: [
            {
                type: String,
            }
        ],
        rating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        location: {
            city: String,
            state: String,
            address: String, // For shops
            zipCode: String,
            isRemote: {
                type: Boolean,
                default: false,
            }
        },
        shopDetails: {
            openingTime: String,
            closingTime: String,
            isHomeDelivery: Boolean,
            shopType: String // e.g. Grocery, Electronics
        },
        geoCoordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isApproved: {
            type: Boolean,
            default: true, // Default to true for faster testing/demo
        }
    },
    {
        timestamps: true,
    }
);

serviceSchema.index({ geoCoordinates: '2dsphere' });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
