import CustomObject from '../models/CustomObject.js';
import CustomObjectRecord from '../models/CustomObjectRecord.js';

export const getObjectTypes = async (req, res) => {
  try {
    const objects = await CustomObject.find({ isActive: true }).sort({ name: 1 });
    res.json(objects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getObjectType = async (req, res) => {
  try {
    const obj = await CustomObject.findById(req.params.id);
    if (!obj) return res.status(404).json({ message: 'Object type not found' });
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createObjectType = async (req, res) => {
  try {
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const obj = await CustomObject.create({ ...req.body, slug, createdBy: req.user._id });
    res.status(201).json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateObjectType = async (req, res) => {
  try {
    const obj = await CustomObject.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!obj) return res.status(404).json({ message: 'Object type not found' });
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteObjectType = async (req, res) => {
  try {
    await CustomObjectRecord.deleteMany({ objectType: req.params.id });
    await CustomObject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Object type deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecords = async (req, res) => {
  try {
    const { objectType, page = 1, limit = 50, search } = req.query;
    const filter = { objectType };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }
    const obj = await CustomObject.findById(objectType);
    const total = await CustomObjectRecord.countDocuments(filter);
    const records = await CustomObjectRecord.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ records, total, page: Number(page), totalPages: Math.ceil(total / limit), objectType: obj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecord = async (req, res) => {
  try {
    const record = await CustomObjectRecord.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('objectType');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRecord = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    const obj = await CustomObject.findById(data.objectType);
    if (obj) {
      obj.recordCount = (obj.recordCount || 0) + 1;
      await obj.save();
    }
    const record = await CustomObjectRecord.create(data);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const record = await CustomObjectRecord.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
      .populate('assignedTo', 'name email');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const record = await CustomObjectRecord.findByIdAndDelete(req.params.id);
    if (record) {
      await CustomObject.findByIdAndUpdate(record.objectType, { $inc: { recordCount: -1 } });
    }
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
