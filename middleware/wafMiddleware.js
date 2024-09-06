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
                        return res.status(403).send('Forbidden: Request blocked by WAF!');
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
            await session.save(); 
        }

        next(); 
    } catch (error) {
        console.error('Error in WAF Middleware:', error);
        res.status(500).send('Internal Server Error');
    }
};




const evaluateRule = (rule, req) => {
    return rule.conditions.every(condition => evaluateCondition(condition, req));
};


const evaluateCondition = (condition, req) => {
    const targetValue = getRequestTargetValue(condition.inspect, condition.fieldName, req);

    switch (condition.type) {
        case 'MATCH':
            return matchValue(condition.match_type, targetValue, condition.value);
        case 'AND':
            return condition.sub_conditions.every(subCondition => evaluateCondition(subCondition, req));
        case 'OR':
            return condition.sub_conditions.some(subCondition => evaluateCondition(subCondition, req));
        case 'NOT':
            return !evaluateCondition(condition.sub_conditions[0], req);
        default:
            return false;
    }
};


const getRequestTargetValue = (inspect, fieldName, req) => {
    switch (inspect) {
        case 'body':
            return req.rawBody.toString();
        case 'headers':
            if (fieldName) {
                return req.headers[fieldName.toLowerCase()] || '';
            }
            return JSON.stringify(req.headers);
        case 'singleHeader':
            return req.headers[fieldName.toLowerCase()] || '';
        case 'allHeaders':
            return JSON.stringify(req.headers);
        case 'cookies':
            if (fieldName) {
                return req.capturedRequest.cookies[fieldName] || '';
            }
            return JSON.stringify(req.capturedRequest.cookies);
        case 'singleCookie':
            return req.capturedRequest.cookies[fieldName] || '';
        case 'allCookies':
            return JSON.stringify(req.capturedRequest.cookies);
        case 'singleQueryParameter':
            return req.capturedRequest.queryParams[fieldName] || '';
        case 'allQueryParameters':
            return JSON.stringify(req.capturedRequest.queryParams);
        case 'uriPath':
            return req.capturedRequest.uriPath;
        case 'queryString':
            return req.capturedRequest.queryString;
        case 'method':
            return req.method;
        default:
            return '';
    }
};


const matchValue = (matchType, targetValue, matchValue) => {
    if (typeof targetValue !== 'string') return false;
    
    switch (matchType) {
        case 'exactlyMatches':
            return targetValue === matchValue;
        case 'startsWith':
            return targetValue.startsWith(matchValue);
        case 'endsWith':
            return targetValue.endsWith(matchValue);
        case 'contains':
            return targetValue.includes(matchValue);
        case 'containsWord':
            return new RegExp(`\\b${matchValue}\\b`).test(targetValue);
        case 'matchesRegex':
            return new RegExp(matchValue).test(targetValue);
        default:
            return false;
    }
};
