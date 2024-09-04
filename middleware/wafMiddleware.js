const RuleGroup = require('../models/ruleGroupModel');
const Session = require('../models/sessionModel');

module.exports = async function wafMiddleware(req, res, next) {
    try {
        const session = await Session.findOne({ sessionId: req.sessionData.sessionId });
        
        if (!session) {
            console.error('WAF Middleware: Session not found');
            return res.status(500).send('Internal Server Error');
        }

        let anomalyScoreIncrease = 0;

        const activeRuleGroups = await RuleGroup.find({ active: true }).populate('rules');
        for (const ruleGroup of activeRuleGroups) {
            for (const rule of ruleGroup.rules) {
                if (evaluateRule(rule, req)) {
                    console.log(`WAF Middleware: Rule matched ${rule.name}`);
                    anomalyScoreIncrease += rule.anomalyScore;  

                    if (rule.action === 'block') {
                        console.log(`WAF Middleware: Blocking request due to rule ${rule.name}`);
                        session.anomalyScore += anomalyScoreIncrease;
                        await session.save(); 
                        return res.status(403).send('Forbidden: Request blocked by WAF!! Stop trying to hack pls');
                    } else if (rule.action === 'allow') {
                        session.anomalyScore += anomalyScoreIncrease;
                        await session.save(); 
                        return next(); 
                    } else if (rule.action === 'monitor') {
                        console.log(`WAF Middleware: Monitoring request due to rule ${rule.name}`);
                    }
                }
            }
        }

        if (anomalyScoreIncrease > 0) {
            console.log(`WAF Middleware: Increasing anomaly score by ${anomalyScoreIncrease}`);
            session.anomalyScore += anomalyScoreIncrease;
            await session.save(); // Ensure the session is saved after updating the anomaly score
        }

        next(); 
    } catch (error) {
        console.error('Error in WAF Middleware:', error);
        res.status(500).send('Internal Server Error');
    }
};


const evaluateRule = (rule, req) => {
    return evaluateCondition(rule.conditions, req);
};

const evaluateCondition = (condition, req) => {
    if (condition.type === 'MATCH') {
        const targetValue = getRequestTargetValue(condition.target, req);
        return matchValue(condition.match_type, targetValue, condition.value);
    } else if (condition.type === 'AND') {
        return condition.sub_conditions.every(subCondition => evaluateCondition(subCondition, req));
    } else if (condition.type === 'OR') {
        return condition.sub_conditions.some(subCondition => evaluateCondition(subCondition, req));
    } else if (condition.type === 'NOT') {
        return !evaluateCondition(condition.sub_conditions[0], req);
    }
    return false;
};

const getRequestTargetValue = (target, req) => {
    switch (target) {
        case 'body':
            return req.rawBody.toString(); 
        case 'headers':
            return JSON.stringify(req.headers);
        case 'query':
            return JSON.stringify(req.query);
        case 'method':
            return req.method;
        case 'url':
            return req.url;
        default:
            return '';
    }
};

const matchValue = (matchType, targetValue, matchValue) => {
    if (typeof targetValue !== 'string') {
        console.error('Invalid target value:', targetValue);
        return false;
    }
    switch (matchType) {
        case 'equals':
            return targetValue === matchValue;
        case 'contains':
            return targetValue.includes(matchValue);
        case 'startsWith':
            return targetValue.startsWith(matchValue);
        case 'endsWith':
            return targetValue.endsWith(matchValue);
        default:
            return false;
    }
};
