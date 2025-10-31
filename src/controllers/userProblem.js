const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {getLanguageById, submitBatch, submitToken} = require("../utils/problemUtility");

const createProblem = async (req,res) => {
    
    const { visibleTestCases,  ReferenceSolution} = req.body;
    

    try{
        for(const {language, completeCode} of ReferenceSolution){
            const languageId = getLanguageById(language);

            //Batch submission
            const submissions = visibleTestCases.map((testcase)=>({
                "source_code": completeCode,
                "language_id": languageId,
                "stdin": testcase.input,
                "expected_output": testcase.output
            }))

            const submitResult = await submitBatch(submissions);
            // console.log(submitResult);

            const resultToken = submitResult.map((val)=>val.token);
            // console.log(resultToken);
            
            const testResult = await submitToken(resultToken);
            // console.log(testResult);

            for(const test of testResult){
                if(test.status_id != 3)
                    return res.status(400).send("Error Occured");
            }
        }

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        res.status(201).send("Problem saved successfully: ");
    }
    catch(err){
        res.status(400).send("Error: "+ err);
    }
}

const updateProblem = async (req, res) => {
    const {id} = req.params;
    const { visibleTestCases,  ReferenceSolution} = req.body;
    try{
        if(!id)
            return res.status(400).send("Missing ID field....");

        const dsaProblem = await Problem.findById(id);
        if(!dsaProblem)
            return res.status(404).send("ID is not present in this server.");
        for(const {language, completeCode} of ReferenceSolution){
            const languageId = getLanguageById(language);

            //Batch submission
            const submissions = visibleTestCases.map((testcase)=>({
                "source_code": completeCode,
                "language_id": languageId,
                "stdin": testcase.input,
                "expected_output": testcase.output
            }))

            const submitResult = await submitBatch(submissions);
            // console.log(submitResult);

            const resultToken = submitResult.map((val)=>val.token);
            // console.log(resultToken);
            
            const testResult = await submitToken(resultToken);
            // console.log(testResult);

            for(const test of testResult){
                if(test.status_id != 3)
                    return res.status(400).send("Error Occured");
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id, {...req.body}, {runValidators: true, new: true}); //new=> new wallah problem return karne ke liya
        res.status(200).send(newProblem);
    }
    catch(err){
        res.status(500).send("Error: "+ err);
    }
}

const deleteProblem = async (req, res) => {
    const {id} = req.params;
    try{
        if(!id)
            return res.status(400).send("ID is missing.");
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if(!deletedProblem)
            return res.status(404).send("Problem is Missing.");

        res.status(200).send("Problem Deleted Successfully.");
    }
    catch(err){
        res.status(500).send("Error: " + err);
    }
}

const getProblemById = async (req, res) => {
    const {id} = req.params;
    try{
        if(!id)
            return res.status(400).send("ID is missing.");
        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode ReferenceSolution');
        if(!getProblem)
            return res.status(404).send("Problem is Missing.");

        res.status(200).send(getProblem);
    }
    catch(err){
        res.status(500).send("Error: " + err);
    }
}

const getAllProblem= async (req, res) => {
    try{
        
        const getProblem = await Problem.find({}).select('_id title difficulty tags');
        if(getProblem.length == 0)
            return res.status(404).send("Problem is Missing.");

        res.status(200).send(getProblem);
    }
    catch(err){
        res.status(500).send("Error: " + err);
    }
}

const solvedAllProblembyUser = async (req, res) => {
    try{
        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select : "_id title difficulty tags"
        })
        res.status(200).send(user.problemSolved);
    }
    catch(err){
        res.status(500).send("Server Error: " + err);
    }
}

const submittedProblem = async (req, res) => {
    try{
        const userId = req.result._id;
        const problemId = req.params.pid;
        const ans = await Submission.find({userId,problemId})
        if(ans.length==0)
            res.status(200).send("No submission is present");
        req.status(200).send(ans);
    }
    catch(err){
        res.status(500).send("Internal Server Error: " + err);
    }
}
module.exports = {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblembyUser, submittedProblem};