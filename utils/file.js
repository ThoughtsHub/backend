const fileInfo = (fullFilename = "nonepng") => {
  let dotSep = fullFilename.lastIndexOf(".");
  if (dotSep === -1) dotSep = fullFilename.length;

  const filename = fullFilename.slice(0, dotSep);
  const fileExt = fullFilename.slice(dotSep + 1);

  const file = { name: filename, ext: fileExt };

  return file;
};

const _file = {
  info: fileInfo,
};

export default _file;
