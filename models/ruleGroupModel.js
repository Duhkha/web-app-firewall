const mongoose = require('mongoose');
const { Schema } = mongoose;

const ruleGroupSchema = new Schema({
  name: { type: String, required: true },
  rules: [{ type: Schema.Types.ObjectId, ref: 'Rule', required: true }],
  active: { type: Boolean, default: true }
});

const RuleGroup = mongoose.model('RuleGroup', ruleGroupSchema);

module.exports = RuleGroup;
