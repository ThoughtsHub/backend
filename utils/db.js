const increment1 = async (model, field, id, transaction) => {
  await model.increment(field, { by: 1, where: { id }, transaction });
};

const decrement1 = async (model, field, id, transaction) => {
  await model.decrement(field, { by: 1, where: { id }, transaction });
};

const dbUnary = {
  increment1,
  decrement1,
};

export default dbUnary;
