import UpgradedBody from "../utils/request.js";

/**
 * Upgrades the user attached body/query to have additional functionalities
 * @param {Request} req
 * @param {Response} _
 * @param {Function} next
 */
const upgradeRequest = (req, _, next) => {
  const body = new UpgradedBody(req.body);
  const query = new UpgradedBody(req.query);
  const params = new UpgradedBody(req.params);

  const method = req.method;
  if (["GET", "DELETE"].includes(method)) req.attachments = query;
  else req.attachments = body;

  req.body = body;
  req.query = query;
  req.params = params;

  next();
};

export default upgradeRequest;
