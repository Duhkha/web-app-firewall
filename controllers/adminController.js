const Settings = require('../models/settingsModel');
const Rule = require('../models/ruleModel');
const RuleGroup = require('../models/ruleGroupModel');

exports.getAdminPage = async (req, res) => {
    try {
        const settings = await Settings.findOne({});
        const rules = await Rule.find({});

        if (!settings) {
            const newSettings = new Settings();
            await newSettings.save();
            return res.render('admin', { settings: newSettings, rules });
        }

        res.render('admin', { settings, rules });
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { blockedCountries, rateLimitWindowMs, rateLimitMaxRequests, anomalyScoreThreshold, blockedIPs, whitelistedIPs } = req.body;

        let settings = await Settings.findOne({});

        if (!settings) {
            settings = new Settings();
        }

        settings.blockedCountries = blockedCountries.split(',').map(country => country.trim());
        settings.rateLimit.windowMs = parseInt(rateLimitWindowMs);
        settings.rateLimit.maxRequests = parseInt(rateLimitMaxRequests);
        settings.anomalyScoreThreshold = parseInt(anomalyScoreThreshold);
        settings.blockedIPs = blockedIPs.split(',').map(ip => ip.trim());
        settings.whitelistedIPs = whitelistedIPs.split(',').map(ip => ip.trim());

        await settings.save();
        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.addRule = async (req, res) => {
    try {
        const { ruleName, description, anomalyScore, action } = req.body;

        const rule = new Rule({
            name: ruleName,
            description,
            anomalyScore: parseInt(anomalyScore),
            action,
            conditions: {} 
        });

        await rule.save();
        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding rule:', error);
        res.status(500).send('Internal Server Error');
    }
};
