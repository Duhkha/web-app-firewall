const mongoose = require('mongoose');
const RuleGroup = require('./models/ruleGroupModel'); // Path to your RuleGroup model

async function populateRuleGroups() {
  await mongoose.connect('mongodb://127.0.0.1:27017/waf', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Copy and paste your rule groups here (Command Injection, File Inclusion, etc.)
  
  // Example:
  const commandInjectionProtectionRuleGroup = new RuleGroup({
    name: 'Command Injection Protection',
    description: 'Rule group to prevent shell injection attacks',
    rules: [
      // ... Add rules for Command Injection Protection here ...
    ]
  });

  const fileInclusionProtectionRuleGroup = new RuleGroup({
    name: 'File Inclusion Protection',
    description: 'Rule group to prevent file inclusion attacks',
    rules: [
      // ... Add rules for File Inclusion Protection here ...
    ]
  });

  // Add all other rule groups here in the same way (e.g., XXE, Shell Injection, etc.)
  
  const ruleGroups = [
    commandInjectionProtectionRuleGroup,
    fileInclusionProtectionRuleGroup,
    // Add all other rule groups here...
  ];

  // Iterate over each rule group and save it to the database
  for (const ruleGroup of ruleGroups) {
    const existingGroup = await RuleGroup.findOne({ name: ruleGroup.name });
    if (existingGroup) {
      console.log(`Rule Group "${ruleGroup.name}" already exists.`);
    } else {
      await ruleGroup.save();
      console.log(`Rule Group "${ruleGroup.name}" created successfully.`);
    }
  }

  mongoose.disconnect();
}

populateRuleGroups().catch(console.error);
