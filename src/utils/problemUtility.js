const axios = require('axios');
const getLanguageById = (lang)=>{
    const language = {
        "c" : 103,
        "c++" : 105,
        "javascript" : 102,
        "python" : 109,
        "java" : 91
    }
    return language[lang.toLowerCase()];
}

const submitBatch = async(submissions)=>{

    const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
        base64_encoded: 'false'
    },
    headers: {
        'x-rapidapi-key': process.env.JUDGE0_KEY,//'6dae91f1b3msh38547e4bd9e3680p168f6ajsne8e0c8daf300',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
    },
    data:{
        submissions
    } 
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    return await fetchData();

}

const waiting = async(timeout)=>{
    setTimeout(() => {
        return 1;
    }, timeout);
}
const submitToken = async (resultToken) => {

    const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
        tokens: resultToken.join(','),
        base64_encoded: 'false',
        fields: '*'
    },
    headers: {
        'x-rapidapi-key': process.env.JUDGE0_KEY,//'6dae91f1b3msh38547e4bd9e3680p168f6ajsne8e0c8daf300',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
    while(true){
        const result =  await fetchData();
        const isResultObtained = result.submissions.every((r)=>r.status_id>2);
        if(isResultObtained)
            return result.submissions;

        await waiting(1000);
    }
}

module.exports = {getLanguageById, submitBatch, submitToken};