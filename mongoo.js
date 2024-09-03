//helper script for me but might use this 
//for other users to populate their waf db

const mongoose = require('mongoose');
const Rule = require('./models/ruleModel');
const RuleGroup = require('./models/ruleGroupModel');

async function createSqlInjectionRuleGroup() {
  await mongoose.connect('mongodb://127.0.0.1:27017/waf', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const rule = new Rule({
    name: "Detect SQL Injection",
    description: "Detects attempts to inject SQL commands into the application",
    conditions: {
      type: "MATCH", 
      target: "body",
      match_type: "contains", 
      value: "SELECT * FROM" 
    },
    action: "block" 
  });
  

  await rule.save();

  const ruleGroup = new RuleGroup({
    name: "SQL Injection Protection",
    rules: [rule._id],
    active: true
  });

  await ruleGroup.save();

  console.log('SQL Injection rule and rule group created successfully.');

  mongoose.disconnect();
}

createSqlInjectionRuleGroup().catch(console.error);
