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
        targetGender: {
            type: String,
            enum: ['male', 'female', 'unisex'],
            default: 'unisex'
        },
        experience: {
            type: Number,
            default: 0
        },
        jobsCompleted: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            required: true,
        },
        servicesIncluded: [String],
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
        images: [String],
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
            isHomeService: { type: Boolean, default: false },
            homeServiceFee: { type: Number, default: 0 },
            shopType: String, // e.g. Grocery, Electronics
            shopAge: { type: Number, default: 0 },
            googleMapsLink: { type: String, default: '' }
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
        coveragePincodes: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
        isApproved: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

serviceSchema.index({ geoCoordinates: '2dsphere' });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
