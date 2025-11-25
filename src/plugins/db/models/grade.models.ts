import mongoose from "mongoose";
import { string } from "zod";
import { required } from "zod/mini";


const { Schema, model } = mongoose;

const gradeFieldSchema = new Schema(
    {
        _id : { type: String },
        batch : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required:true,
        },
        subject : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required:true,
        },
        type : { 
			type: String, 
			required:true,
			enum: ["exam", "assignment", "practical" , "attendance", "moderation"]
		},
        name: { type: String, required: true },
        total_mark : { type: Number, required: true },
        weightage : { type: Number, required: true },
        value : {
            type : String,
            required : false,
        },
        assignment_id : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required:false,
        },
    },
    { collection: "grade_field" },
);

gradeFieldSchema.pre('save', function(next) {
    if (this.type != "moderation") {
       this.value = "";
    }

    if(this.type === "moderation" && (this.value === null || this.value === undefined || this.value === "")) {
        return next(new Error("Value is required for moderation type"));
    }

     if (this.type != "assignment") {
       this.assignment_id = undefined;
    }

    if(this.type === "assignment" && !this.assignment_id) {
        return next(new Error("Assignment ID is required for assignment type"));
    }

    next();
});


const gradeEntrySchema = new Schema(
    {
        _id : { type: String },
        user : {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required:true,
        },
        grade_field : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GradeField",
            required:true,
        },
        mark : {type:Number,reuired:true},
        is_absent : {type: Boolean,required:true},
        remarks : { type: String },
        updated_at : { type: Date, required: true },
    },
    { collection: "grade_entry" },
);  


const GradeField = model("GradeField", gradeFieldSchema);
const GradeEntry = model("GradeEntry", gradeEntrySchema);

export { GradeField, GradeEntry };