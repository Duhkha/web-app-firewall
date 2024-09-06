const Settings = require('../models/settingsModel');
const Rule = require('../models/ruleModel');
const RuleGroup = require('../models/ruleGroupModel');

exports.getDashboard = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        const rules = await Rule.find();
        const ruleGroups = await RuleGroup.find().populate('rules');
        
        res.render('admin/admin', { 
            title: 'Admin Dashboard',
            user: req.user,
            settings: settings,
            rules: rules,
            ruleGroups: ruleGroups
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
};



exports.saveSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings();
        }

        const settingsData = {
            blockedCountries: req.body.blockedCountries,
            rateLimit: {
                windowMs: req.body.rateLimitWindowMs,
                maxRequests: req.body.rateLimitMaxRequests
            },
            anomalyScoreThreshold: req.body.anomalyScoreThreshold,
            blockedIPs: req.body.blockedIPs,
            whitelistedIPs: req.body.whitelistedIPs
        };

        Object.assign(settings, settingsData);

        await settings.save();
        res.status(200).json({ message: 'Settings saved successfully' });
    } catch (err) {
        console.error('Error saving settings:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.saveRule = async (req, res) => {
    try {
        const ruleData = {
            name: req.body.ruleName,
            description: req.body.description,
            anomalyScore: req.body.anomalyScore,
            action: req.body.action,
            conditions: req.body.conditions
        };

        if (req.params.id) {
            // Edit existing rule
            await Rule.findByIdAndUpdate(req.params.id, ruleData);
        } else {
            // Add new rule
            const newRule = new Rule(ruleData);
            await newRule.save();

            // Find or create the "undefined" group
            let ruleGroup = await RuleGroup.findOne({ name: 'undefined' });

            if (!ruleGroup) {
                ruleGroup = new RuleGroup({
                    name: 'undefined',
                    description: 'Group for rules with no defined group',
                    rules: []
                });
            }

            ruleGroup.rules.push(newRule._id);
            await ruleGroup.save();
        }

        res.status(200).json({ message: 'Rule saved successfully' });
    } catch (err) {
        console.error('Error saving rule:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getRule = async (req, res) => {
    try {
        const rule = await Rule.findById(req.params.id).exec();
        res.json(rule);
    } catch (err) {
        console.error('Error fetching rule:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getRuleGroup = async (req, res) => {
    try {
        const ruleGroup = await RuleGroup.findById(req.params.id).populate('rules').exec();

        res.json(ruleGroup);
    } catch (err) {
        console.error('Error fetching rule:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteRule = async (req, res) => {
    try {
        await Rule.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Rule deleted successfully' });
    } catch (err) {
        console.error('Error deleting rule:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

//not used
exports.addRuleGroup = async (req, res) => {
    try {
        const { ruleGroupName, ruleGroupDescription } = req.body;
        const ruleGroup = new RuleGroup({ name: ruleGroupName, description: ruleGroupDescription });
        await ruleGroup.save();
        res.redirect('/admin');
    } catch (err) {
        console.error('Error adding rule group:', err);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteRuleGroup = async (req, res) => {
    try {
        await RuleGroup.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Rule Group deleted successfully' });
    } catch (err) {
        console.error('Error deleting rule:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.saveRuleGroup = async (req, res) => {
    try {
        const { ruleGroupName, ruleGroupDescription, rules } = req.body;

        let ruleGroup;

        if (req.params.id) {
            ruleGroup = await RuleGroup.findById(req.params.id);
            if (!ruleGroup) {
                return res.status(404).json({ message: 'Rule group not found' });
            }
            ruleGroup.name = ruleGroupName;
            ruleGroup.description = ruleGroupDescription;
        } else {
            ruleGroup = new RuleGroup({
                name: ruleGroupName,
                description: ruleGroupDescription,
                rules: []
            });
        }

        if (rules && rules.length > 0) {
            for (const rule of rules) {
                const ruleData = {
                    name: rule.name,
                    description: rule.description,
                    anomalyScore: rule.anomalyScore,
                    action: rule.action,
                    conditions: rule.conditions
                };

                let savedRule;
                if (rule._id) {
                    savedRule = await Rule.findByIdAndUpdate(rule._id, ruleData, { new: true });
                } else {
                    savedRule = new Rule(ruleData);
                    await savedRule.save();
                }

                if (!ruleGroup.rules.includes(savedRule._id)) {
                    ruleGroup.rules.push(savedRule._id);
                }
            }
        }

        await ruleGroup.save();
        res.status(200).json({ message: 'Rule group saved successfully' });
    } catch (err) {
        console.error('Error saving rule group:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.toggleActivation = async (req, res) => {
    try {
        const ruleGroupId = req.params.id;

        const ruleGroup = await RuleGroup.findById(ruleGroupId);

        if (!ruleGroup) {
            return res.status(404).json({ message: 'Rule group not found' });
        }

        ruleGroup.active = !ruleGroup.active;

        await ruleGroup.save();

        res.status(200).json({ message: 'Rule group activation status updated successfully' });
    } catch (err) {
        console.error('Error toggling activation status:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};