const Collection = require("../models/collection.model");

const getAllCollection = (req, res, next) => {
  Collection.find()
    .then((collections) => {
      res.status(200).json({
        status: true,
        data: collections.map((collection) => {
          return {
            id: collection._id,
            name: collection.name,
            slug: collection.slug,
            contract_address: collection.contract_address,
          };
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

const getCollectionById = (req, res, next) => {
  const id = req.params.id;

  Collection.find(id)
    .then((collection) => {
      res.status(200).json({
        status: true,
        data: {
          id: collection._id,
          name: collection.name,
          slug: collection.slug,
          contract_address: collection.contract_address,
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

const addCollection = (req, res, next) => {
  const new_collection = new Collection({
    name: req.body.name,
    slug: req.body.slug,
    contract_address: req.body.contract_address,
  });
  new_collection
    .save()
    .then((collection) => {
      res.status(201).json({
        status: true,
        data: {
          id: collection._id,
          name: collection.name,
          slug: collection.slug,
          contract_address: collection.contract_address,
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
  getAllCollection,
  addCollection,
  getCollectionById,
};
