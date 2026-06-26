import mongoose from 'mongoose';

const automationRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },
  trigger: { type: String, enum: [
    'deal.created', 'deal.stage_changed', 'deal.won', 'deal.lost',
    'contact.created', 'contact.email_opened', 'contact.visited_pricing',
    'lead.score_changed', 'form.submitted',
  ], required: true },
  triggerValue: { type: String, default: '' },
  actions: [{
    type: { type: String, enum: [
      'assign_owner', 'change_stage', 'add_tag', 'send_email',
      'create_task', 'create_deal', 'notify_slack', 'score_lead',
      'update_field',
    ], required: true },
    config: mongoose.Schema.Types.Mixed,
  }],
  priority: { type: Number, default: 0 },
  runCount: { type: Number, default: 0 },
  lastRun: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('AutomationRule', automationRuleSchema);
