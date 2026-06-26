import Resource from '../models/Resource.js';
import User from '../models/User.js';

export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('user', 'name email role')
      .populate('assignments.project', 'name status')
      .sort({ currentAllocation: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('assignments.project', 'name status clientName');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrUpdate = async (req, res) => {
  try {
    const existing = await Resource.findOne({ user: req.body.user });
    if (existing) {
      const resource = await Resource.findByIdAndUpdate(existing._id, req.body, { returnDocument: 'after' })
        .populate('user', 'name email role');
      return res.json(resource);
    }
    const resource = await Resource.create(req.body);
    await resource.populate('user', 'name email role');
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCapacityReport = async (req, res) => {
  try {
    const resources = await Resource.find().populate('user', 'name email role');
    const report = resources.map((r) => {
      const capacity = r.weeklyCapacity || 40;
      const allocated = r.currentAllocation || 0;
      const available = Math.max(0, capacity - allocated);
      const utilization = capacity > 0 ? Math.round((allocated / capacity) * 100) : 0;
      return {
        _id: r._id,
        user: r.user,
        role: r.role,
        weeklyCapacity: capacity,
        currentAllocation: allocated,
        available,
        utilization,
        status: utilization >= 100 ? 'overbooked' : utilization >= 80 ? 'full' : utilization >= 50 ? 'partial' : 'available',
        assignments: r.assignments,
        timeOff: r.timeOff,
      };
    });
    const overall = {
      totalCapacity: resources.reduce((s, r) => s + (r.weeklyCapacity || 40), 0),
      totalAllocated: resources.reduce((s, r) => s + (r.currentAllocation || 0), 0),
      avgUtilization: resources.length > 0
        ? Math.round(resources.reduce((s, r) => s + ((r.currentAllocation || 0) / (r.weeklyCapacity || 40)) * 100, 0) / resources.length)
        : 0,
    };
    res.json({ resources: report, overall });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    const { action, assignment } = req.body;
    if (action === 'add') {
      resource.assignments.push(assignment);
    } else if (action === 'remove') {
      resource.assignments = resource.assignments.filter((a) => a._id.toString() !== assignment.id);
    }
    resource.currentAllocation = resource.assignments.reduce((s, a) => s + (a.allocation || 0), 0);
    resource.status = resource.currentAllocation >= resource.weeklyCapacity ? 'full' : resource.currentAllocation > 0 ? 'partial' : 'available';
    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTimeOff = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    resource.timeOff.push(req.body);
    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
