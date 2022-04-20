const knex = require("../db/connection");

function create(newObservation) {
    return knex("observations").insert(newObservation).returning("*");
}

function list() {
    return knex("observations").select("*");
}

function read(observation_id){
    return knex("observations")
        .select("*")
        .where({observation_id})
        .first();
}

function update(observationUpdate) {
    return knex("observations")
        .select("*")
        .where({observation_id: observationUpdate.observation_id})
        .update(observationUpdate, "*")
        .then(updatedRecords => updatedRecords[0]);
}

module.exports = {
    create,
    list,
    update,
    read
};