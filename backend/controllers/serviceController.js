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

        const locFilter = req.query.location
            ? {
                'location.city': {
                    $regex: req.query.location,
                    $options: 'i',
                }
            } : {};

        const services = await Service.find({ ...keyword, ...category, ...locFilter, isActive: true, isApproved: true })
            .populate('provider', 'name avatar');

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
            .populate('provider', 'name email avatar providerDetails');

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

        const { title, category, subCategory, description, price, priceType, images, location } = req.body;

        const service = new Service({
            title,
            category,
            subCategory,
            description,
            price,
            priceType,
            images,
            location,
            provider: req.user._id,
            isApproved: false, // Always starts pending admin review
            isActive: false,
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
        const { title, category, description, price, priceType, isActive } = req.body;

        const service = await Service.findById(req.params.id);

        if (service) {
            // Check if user is the provider representing the service
            if (service.provider.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this service' });
            }

            service.title = title || service.title;
            service.category = category || service.category;
            service.description = description || service.description;
            service.price = price || service.price;
            service.priceType = priceType || service.priceType;

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
