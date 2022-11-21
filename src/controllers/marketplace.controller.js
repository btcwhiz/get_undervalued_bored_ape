const Marketplace = require("../models/marketplace.model");

const getAllMarketplace = (req, res, next) => {
  Marketplace.find()
    .then((marketplaces) => {
      res.status(200).json({
        status: true,
        data: marketplaces.map((marketplace) => {
          return { id: marketplace._id, name: marketplace.name };
        }),
      });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
        next(e);
      }
    });
};

const getMarketplaceById = (req, res, next) => {
  const id = req.params.id;

  Marketplace.find(id)
    .then((marketplace) => {
      res.status(200).json({
        status: true,
        data: {
          id: marketplace._id,
          name: marketplace.name,
        },
      });
    })
    .catch((e) => {
      if (!e.status.code) {
        e.statusCode = 500;
        next(e);
      }
    });
};

const addMarketplace = (req, res, next) => {
  const new_marketplace = new Marketplace({
    name: req.body.name,
  });
  new_marketplace
    .save()
    .then((marketplace) => {
      res.status(201).json({
        status: true,
        data: {
          id: marketplace._id,
          name: marketplace.name,
        },
      });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
        next(e);
      }
    });
};

module.exports = {
  getAllMarketplace,
  addMarketplace,
  getMarketplaceById,
};
