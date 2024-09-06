const mongoose = require('mongoose');
const { Schema } = mongoose;

const ruleGroupSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  rules: [{ type: Schema.Types.ObjectId, ref: 'Rule' }],
  active: { type: Boolean, default: true }
});

const RuleGroup = mongoose.model('RuleGroup', ruleGroupSchema);
module.exports = RuleGroup;
