const mongoose = require('mongoose');
const { Schema } = mongoose;

const conditionSchema = new Schema({
  type: { type: String, enum: ['AND', 'OR', 'NOT', 'MATCH'], required: true },
  target: { type: String, enum: ['body', 'headers', 'query', 'method', 'url'], required: function() { return this.type === 'MATCH'; } },
  match_type: { type: String, enum: ['equals', 'contains', 'startsWith', 'endsWith'], required: function() { return this.type === 'MATCH'; } },
  value: { type: String, required: function() { return this.type === 'MATCH'; } },
  sub_conditions: [this] // nested conditions for AND/OR/NOT
});

const ruleSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  conditions: { type: conditionSchema, required: true },
  action: { type: String, enum: ['block', 'allow', 'monitor'], required: true },
  anomalyScore: { type: Number, default: 0 }  
});

const Rule = mongoose.model('Rule', ruleSchema);

module.exports = Rule;
