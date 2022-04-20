const service = require("./observations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");


const validSkyConditions = [100, 101, 102, 103, 104, 106, 108, 109];

async function observationExists(req, res, next) {
    const { observationId } = req.params;
    const observationRes = await service.read(observationId);
    if (observationRes) {
        res.locals.observation = observationRes;
        return next();
    }

    next({ status: 404, message: `Observation with ID: ${observationId} not found.` });
}

function hasData(req, res, next) {
    if (req.body.data) {
        return next();
    }
    next({ status: 400, message: `Body must have data property` });
}

function hasLatitude(req, res, next) {
    const latitude = Number(req.body.data.latitude);
    if (latitude >= -90 && latitude <= 90) {
        return next();
    }
    next({ status: 400, message: `Latitude must be between -90 and 90` });
}

function hasLongitude(req, res, next) {
    const longitude = Number(req.body.data.longitude);
    if (longitude >= -180 && longitude <= 180) {
        return next();
    }
    next({ status: 400, message: `Longitude must be between -180 and 180` });
}

function hasSkyCondition(req, res, next) {
    const skyCondition = Number(req.body.data.sky_condition);

    if (validSkyConditions.includes(skyCondition)) {
        return next();
    }
    next({ status: 400, message: `sky_condition must be one of: ${validSkyConditions.join(", ")}` })
}

async function create(req, res) {
    const { data } = req.body;
    const newObservation = await service.create(data);

    res.status(201).json({ data: newObservation });
}

async function list(req, res) {
    const data = await service.list();
    res.json({ data });
}

async function read(req, res) {
    const {observation} = res.locals;
    res.json({data: observation});
}

async function update(req, res) {
    const { observation } = res.locals;
    const { data } = req.body;
    const updatedObservation = { ...data, observation_id: observation.observation_id }

    res.status(201).json({ data: await service.update(updatedObservation) });
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: [hasData, hasLatitude, hasLongitude, hasSkyCondition, asyncErrorBoundary(create)],
    read: [asyncErrorBoundary(observationExists), read],
    update: [asyncErrorBoundary(observationExists), hasData, hasLatitude, hasLongitude, hasSkyCondition, asyncErrorBoundary(update)]
};