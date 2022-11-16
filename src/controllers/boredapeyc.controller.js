const getMe = (req, res) => {
  res.status(200).json({
    status: "Success",
    msg: "Get Me",
  });
};

module.exports = {
  getMe,
};
