const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  console.log('api/categories')
    try {
      const categoryData = await Category.findAll({
        // include:{
        //     model: Product,
        //     attributes: ['id', 'product_name','price', 'category_id']
        //   }
      });
      res.status(200).json(categoryData);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  // find all categories
  // be sure to include its associated Products


router.get('/:id', async(req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      where: {
        id: req.params.id
      },
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async(req, res) => {
  // create a new category
  Category.create(req.body)
    .then((category) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const categoryTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            category_id: category.id,
            tag_id,
          };
        });
        return categoryTag.bulkCreate(categoryTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(category);
    })
    .then((categoryTagIds) => res.status(200).json(categoryTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});


router.put('/:id', async(req, res) => {
  // update a category by its `id` value
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((category) => {
      // find all associated tags from ProductTag
      return categoryTag.findAll({ where: { category_id: req.params.id } });
    })
    .then((categoryTags) => {
      // get list of current tag_ids
      const categoryTagIds = categoryTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newCategoryTags = req.body.tagIds
        .filter((tag_id) => !categoryTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            category_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const categoryTagsToRemove = categoryTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        CategoryTag.destroy({ where: { id: categoryTagsToRemove } }),
        CategoryTag.bulkCreate(newCategoryTags),
      ]);
    })
    .then((updatedCategoryTags) => res.json(updatedCategoryTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async(req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id
      },
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
