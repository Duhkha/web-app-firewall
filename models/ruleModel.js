const mongoose = require('mongoose');
const { Schema } = mongoose;

const conditionSchema = new Schema({
  type: { type: String, enum: ['AND', 'OR', 'NOT', 'MATCH'], required: true },
  inspect: { 
    type: String, 
    enum: [
      'singleHeader', 
      'allHeaders', 
      'singleCookie', 
      'allCookies', 
      'singleQueryParameter', 
      'allQueryParameters', 
      'uriPath', 
      'queryString', 
      'body', 
      'method'
    ], 
    required: true 
  },
  fieldName: { type: String, required: function() { return ['singleHeader', 'singleCookie', 'singleQueryParameter'].includes(this.inspect); } }, // Field name required only for specific inspections
  match_type: { 
    type: String, 
    enum: [
      'exactlyMatches', 
      'startsWith', 
      'endsWith', 
      'contains', 
      'containsWord', 
      'matchesRegexPatternSet', 
      'matchesRegex'
    ], 
    required: true 
  },
  value: { type: String, required: true }, // string or regex to match
  sub_conditions: [this] // nested conditions for AND/OR/NOT
});

const ruleSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  conditions: { type: [conditionSchema], required: true }, // multiple conditions allowed
  action: { type: String, enum: ['block', 'allow', 'count', 'captcha'], required: true },
  anomalyScore: { type: Number, default: 0 }  
});

const Rule = mongoose.model('Rule', ruleSchema);
module.exports = Rule;