const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow("", null), // Allows empty description
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({  
            filename: Joi.string().allow("", null),  // ✅ Allow filename
            url: Joi.string().uri().allow("", null)  // ✅ Allow empty or valid URL
        }).optional(),
        ownerId: Joi.string().required()  // ✅ Make `image` optional
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});
