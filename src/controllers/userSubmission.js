const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {getLanguageById, submitBatch, submitToken} = require("../utils/problemUtility");

const submitCode = async (req, res) => {
    try{
        const userId = req.result._id;
        const problemId = req.params.id;
        const {code, language} = req.body;

        if(!userId || !problemId || !code || !language)
            return res.status(400).send("Some field is missing.");

        // fetch the problem from db
        const problem = await Problem.findById(problemId);

        //store submission
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status : "pending",
            testCasesTotal: problem.hiddenTestCases.length
        })

        //judge0 ko code submit
        const languageId = getLanguageById(language);


        const submissions = problem.hiddenTestCases.map((testcase)=>({
            "source_code": code,
            "language_id": languageId,
            "stdin": testcase.input,
            "expected_output": testcase.output
        }))

        const submitResult = await submitBatch(submissions);
        

        const resultToken = submitResult.map((val)=>val.token);
        
        
        const testResult = await submitToken(resultToken);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;

        for(let test of testResult){
            if(test.status_id === 3){
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            }
            else{
                if(test.status_id === 4){
                    status = "error";
                    errorMessage = test.stderr;
                }
                else{
                    status = "wrong";
                    errorMessage = test.stderr;
                }
            }

        }

        // store the result in submission db
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        
        await submittedResult.save();

        //Prolem id ko insert karenge user schema ke under problem solved main if it's does not exist
        if(!req.result.problemSolved.includes(problemId)){
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        res.status(201).send(submittedResult);

    }
    catch(err){
        res.status(500).send("Internal Server Error: " + err);
    }
}

const runCode = async (req, res) => {
    try{
        const userId = req.result._id;
        const problemId = req.params.id;
        const {code, language} = req.body;

        if(!userId || !problemId || !code || !language)
            return res.status(400).send("Some field is missing.");

        // fetch the problem from db
        const problem = await Problem.findById(problemId);

        //judge0 ko code submit
        const languageId = getLanguageById(language);


        const submissions = problem.visibleTestCases.map((testcase)=>({
            "source_code": code,
            "language_id": languageId,
            "stdin": testcase.input,
            "expected_output": testcase.output
        }))

        const submitResult = await submitBatch(submissions);
        

        const resultToken = submitResult.map((val)=>val.token);
        
        
        const testResult = await submitToken(resultToken);

        

        res.status(201).send(testResult);

    }
    catch(err){
        res.status(500).send("Internal Server Error: " + err);
    }
}
module.exports = {submitCode, runCode};