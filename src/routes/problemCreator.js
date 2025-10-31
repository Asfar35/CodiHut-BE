const express = require('express');
const problemRouter =  express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require("../middleware/userMiddleware");
const {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblembyUser, submittedProblem} = require("../controllers/userProblem");



// Create
problemRouter.post("/create",adminMiddleware ,createProblem);
// update
problemRouter.put("/update/:id",adminMiddleware, updateProblem);
// delete 
problemRouter.delete("/delete/:id",adminMiddleware, deleteProblem);

// fetch
problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware, getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);


module.exports = problemRouter;




