const jsonfile = require("jsonfile");

const getMe = async (req, res) => {
  await updateFloorPrices();
  res.status(200).json({
    status: "success",
  });
};

const getListedNFTs = (req, res) => {
  const nfttype = req.params.nfttype;
  const nfttype_list = jsonfile.readFileSync(
    __dirname + "/../data/common/nfttype.json"
  );

  console.log(nfttype_list);
  const nft_file = nfttype_list.filter((item) => {
    console.log(item.type, nfttype);
    return item.type == nfttype;
  });

  console.log(nft_file);

  if (nft_file.length == 0) {
    res.status(404).json({
      status: false,
      msg: "Unsupported nft",
    });
  } else {
    const filename = nft_file[0].filename;
    jsonfile.readFile(
      __dirname + `/../data/listednfts/${filename}`,
      (error, data) => {
        if (error) {
          console.log(error);
          res.status(404).json({
            status: "Faild",
          });
        } else {
          res.status(200).json({
            status: true,
            data: data,
          });
        }
      }
    );
  }
};

module.exports = {
  getMe,
  getListedNFTs,
};
