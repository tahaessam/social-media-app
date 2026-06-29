"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReactionModel = void 0;
var mongoose_1 = require("mongoose");
var enum_js_1 = require("../../shared/enums/enum.js");
var userReactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    refId: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: "onModel",
        required: true,
    },
    onModel: {
        type: String,
        enum: Object.values(enum_js_1.On_model),
        required: true,
    },
    reactionType: {
        type: String,
        enum: Object.values(enum_js_1.ReactionType),
        required: true,
    },
}, {
    timestamps: true,
});
exports.UserReactionModel = (0, mongoose_1.model)("UserReaction", userReactionSchema);
