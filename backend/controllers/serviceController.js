import Service from '../models/Service.js';

// @desc    Fetch all services (with filtering)
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                title: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const category = req.query.category ? { category: req.query.category } : {};
        const businessType = req.query.businessType ? { businessType: req.query.businessType } : {};

        const locFilter = req.query.location
            ? {
                'location.city': {
                    $regex: req.query.location,
                    $options: 'i',
                }
            } : {};

        const services = await Service.find({ ...keyword, ...category, ...businessType, ...locFilter, isActive: true, isApproved: true })
            .populate('provider', 'name username avatar');

        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single service
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('provider', 'name username email avatar providerDetails createdAt');

        if (service) {
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a service (submit for admin approval)
// @route   POST /api/services
// @access  Private (any user with role=provider)
export const createService = async (req, res) => {
    try {
        // Must be a provider to submit a gig
        if (req.user.role !== 'provider') {
            return res.status(403).json({ message: 'Only providers can create services' });
        }

        const { title, category, subCategory, description, businessType, plans, shopDetails, price, priceType, images, location, geoCoordinates } = req.body;

        const service = new Service({
            title,
            category,
            subCategory,
            description,
            businessType,
            plans,
            shopDetails,
            price,
            priceType,
            images,
            location,
            geoCoordinates: geoCoordinates || { type: 'Point', coordinates: [0, 0] },
            provider: req.user._id,
            isApproved: false, // Now requires admin approval
            isActive: true,
        });

        const createdService = await service.save();
        res.status(201).json(createdService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current provider's own gigs (all statuses)
// @route   GET /api/services/mine
// @access  Private
export const getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ provider: req.user._id }).sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Provider
export const updateService = async (req, res) => {
    try {
        const { 
            title, category, subCategory, description, businessType, 
            price, priceType, plans, shopDetails, location, 
            geoCoordinates, coveragePincodes, experience, jobsCompleted, 
            images, isActive 
        } = req.body;

        const service = await Service.findById(req.params.id);

        if (service) {
            if (service.provider.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this service' });
            }

            service.title = title || service.title;
            service.category = category || service.category;
            service.subCategory = subCategory || service.subCategory;
            service.description = description || service.description;
            
            if (businessType) {
                service.businessType = businessType;
            }
            
            service.price = price !== undefined ? price : service.price;
            service.priceType = priceType || service.priceType;
            service.plans = plans || service.plans;
            service.images = images || service.images;
            service.experience = experience !== undefined ? experience : service.experience;
            service.jobsCompleted = jobsCompleted !== undefined ? jobsCompleted : service.jobsCompleted;

            if (shopDetails) {
                service.shopDetails = { ...service.shopDetails, ...shopDetails };
            }
            
            if (location) {
                const locationData = { ...location };
                if (locationData.pincode && !locationData.zipCode) {
                    locationData.zipCode = locationData.pincode;
                }
                service.location = { ...service.location, ...locationData };
            }

            if (geoCoordinates) {
                service.geoCoordinates = geoCoordinates;
            }

            if (coveragePincodes) {
                service.coveragePincodes = coveragePincodes;
            }

            if (isActive !== undefined) {
                service.isActive = isActive;
            }

            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Provider
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            // Check if user is the provider
            if (service.provider.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to delete this service' });
            }

            await service.deleteOne();
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch nearby services
// @route   GET /api/services/nearby
// @access  Public
export const getNearbyServices = async (req, res) => {
    try {
        const { lng, lat, distance = 5 } = req.query; // distance in km
        
        if (!lng || !lat) {
            return res.status(400).json({ message: 'Longitude and latitude are required' });
        }

        const radius = distance / 6378.1; // Convert km to radians

        const services = await Service.find({
            isActive: true,
            isApproved: true,
            geoCoordinates: {
                $geoWithin: {
                    $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius]
                }
            }
        }).populate('provider', 'name avatar');

        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
