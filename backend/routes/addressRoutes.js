import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const serializeAddress = (address) => ({
    id: address._id,
    label: address.label,
    contactName: address.contactName,
    phoneNumber: address.phoneNumber,
    line1: address.line1,
    line2: address.line2,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: Boolean(address.isDefault),
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
});

const sortAddresses = (addresses = []) =>
    [...addresses].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });

const ensureAddressList = (user) => {
    if (!Array.isArray(user.addresses)) {
        user.addresses = [];
    }
    return user.addresses;
};

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const response = sortAddresses(ensureAddressList(user)).map(serializeAddress);
        return res.json({ addresses: response });
    } catch (error) {
        console.error('[addressRoutes] list error', error);
        return res.status(500).json({ message: 'Failed to load addresses', error: error.message });
    }
});

const validateRequiredFields = (payload = {}) => {
    const required = ['contactName', 'phoneNumber', 'line1', 'city', 'state', 'postalCode'];
    const missing = required.filter((key) => !payload[key] || String(payload[key]).trim().length === 0);
    return missing;
};

router.post('/', async (req, res) => {
    try {
        const missing = validateRequiredFields(req.body || {});
        if (missing.length) {
            return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressList = ensureAddressList(user);
        const shouldBeDefault = Boolean(req.body.isDefault) || addressList.length === 0;

        if (shouldBeDefault) {
            addressList.forEach((address) => {
                address.isDefault = false;
            });
        }

        const newAddress = addressList.create({
            label: req.body.label,
            contactName: req.body.contactName,
            phoneNumber: req.body.phoneNumber,
            line1: req.body.line1,
            line2: req.body.line2,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            postalCode: req.body.postalCode,
            country: req.body.country,
            isDefault: shouldBeDefault,
        });

        addressList.push(newAddress);
        await user.save();

        const addresses = sortAddresses(addressList).map(serializeAddress);
        return res.status(201).json({ message: 'Address saved', address: serializeAddress(newAddress), addresses });
    } catch (error) {
        console.error('[addressRoutes] create error', error);
        return res.status(500).json({ message: 'Failed to save address', error: error.message });
    }
});

router.put('/:addressId', async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressList = ensureAddressList(user);
        const address = addressList.id(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        if (req.body.isDefault && !address.isDefault) {
            addressList.forEach((item) => {
                item.isDefault = false;
            });
            address.isDefault = true;
        } else if (req.body.isDefault === false && address.isDefault) {
            address.isDefault = false;
        }

        const fields = ['label', 'contactName', 'phoneNumber', 'line1', 'line2', 'landmark', 'city', 'state', 'postalCode', 'country'];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                address[field] = req.body[field];
            }
        });

        await user.save();
        const addresses = sortAddresses(addressList).map(serializeAddress);
        return res.json({ message: 'Address updated', address: serializeAddress(address), addresses });
    } catch (error) {
        console.error('[addressRoutes] update error', error);
        return res.status(500).json({ message: 'Failed to update address', error: error.message });
    }
});

router.delete('/:addressId', async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressList = ensureAddressList(user);
        const address = addressList.id(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const wasDefault = Boolean(address.isDefault);
        address.deleteOne();

        if (wasDefault && addressList.length) {
            addressList[0].isDefault = true;
        }

        await user.save();
        const addresses = sortAddresses(addressList).map(serializeAddress);
        return res.json({ message: 'Address deleted', addresses });
    } catch (error) {
        console.error('[addressRoutes] delete error', error);
        return res.status(500).json({ message: 'Failed to delete address', error: error.message });
    }
});

router.patch('/:addressId/default', async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressList = ensureAddressList(user);
        const address = addressList.id(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        addressList.forEach((item) => {
            item.isDefault = false;
        });
        address.isDefault = true;

        await user.save();
        const addresses = sortAddresses(addressList).map(serializeAddress);
        return res.json({ message: 'Default address updated', addresses });
    } catch (error) {
        console.error('[addressRoutes] default error', error);
        return res.status(500).json({ message: 'Failed to set default address', error: error.message });
    }
});

export default router;
