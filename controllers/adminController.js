const Rule = require('../models/ruleModel');

exports.getStatus = async (req, res) => {
  res.json({ message: "System is running", status: "Operational" });
};

exports.updateRules = async (req, res) => {
  try {
    const rule = new Rule(req.body);
    await rule.save();
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
