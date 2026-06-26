import { getNextBestActions, generateReply, generateMeetingSummary, getPredictiveInsights } from '../services/aiService.js';

export const getSuggestions = async (req, res) => {
  try {
    const suggestions = await getNextBestActions(req.user._id);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReplySuggestions = async (req, res) => {
  try {
    const { emailBody } = req.body;
    const templates = await generateReply(emailBody || '', {
      userName: req.user.name,
      userEmail: req.user.email,
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMeetingSummary = async (req, res) => {
  try {
    const { title, attendees, duration, notes } = req.body;
    const summary = await generateMeetingSummary(title, attendees, duration, notes);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPredictiveInsightsAction = async (req, res) => {
  try {
    const insights = await getPredictiveInsights();
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
