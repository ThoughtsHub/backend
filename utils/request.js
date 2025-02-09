const getData = (data = {}, exclude = [], excludeTimestamps = true) => {
  const _data = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value != null)
  );

  // timestamps not required
  if (excludeTimestamps) exclude = [...exclude, "createdAt", "updatedAt"];

  let result = [];

  for (const exclusion of exclude) {
    result.push(_data[exclusion] ?? null);
    delete _data[exclusion];
  }

  result = [_data, ...result];

  return result;
};

export default getData;
