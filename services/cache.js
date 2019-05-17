const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys");

const client = redis.createClient(keys.redisUrl);

client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

/**
 * @summary
 * @param
 * @returns - The updated query to be chained with further requests
 */
mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};
/**
 *  @summary -
 *  @this - The Query that will be executed
 *  @returns -
 */
mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  //Use nested hash values
  const cachedValue = await client.hget(this.hashKey, key);

  if (cachedValue) {
    const cachedDoc = JSON.parse(cachedValue);

    return Array.isArray(cachedDoc)
      ? cachedDoc.map(doc => new this.model(doc))
      : new this.model(cachedDoc);
  }
  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, key, JSON.stringify(result), "EX", 10);
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
