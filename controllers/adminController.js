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

exports.deleteRule = async (req, res) => {
    try {
        await Rule.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Rule deleted successfully' });
    } catch (err) {
        console.error('Error deleting rule:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


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
