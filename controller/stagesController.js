import { getUserID } from "../commonModule.js"
import { responseStatus } from "../response.js"
import { connection } from "../settings/db.js"

export const getStages = (req, res) => {

    const sql = `SELECT st.projectID,pr.projectName, st.taskID, ts.taskName, st.userID, us.userName, us.userSurname, st.statusID, startDatePlan, endDatePlan, st.stageNumber, st.stageDescription
    FROM projectstages st, projects pr, tasks ts, users us
    WHERE pr.projectID=st.projectID AND ts.taskID=st.taskID AND us.userID=st.userID;`

    connection.query(sql, (error, rows, fields) => {
        if (error) {
            responseStatus(500, error)
        } else {
            responseStatus(200, rows, res)
        }
    })
}

export const getUsersStages = (req, res) =>{

    const sql=`SELECT st.projectID,pr.projectName, st.taskID, ts.taskName, st.userID, us.userName, us.userSurname, st.statusID, startDatePlan, endDatePlan, st.stageNumber, st.stageDescription
    FROM projectstages st, projects pr, tasks ts, users us
    WHERE pr.projectID=st.projectID AND ts.taskID=st.taskID AND us.userID=st.userID AND st.userID=?`

    const userID=getUserID(req.headers['authorization'])

    if(!userID){
        responseStatus(500, {message: "ошибка чтения токена"}, res)
    }
    connection.query(sql, userID, (error, rows, fields) => {
        if (error) {
            responseStatus(500, error, res)
        } else {
            responseStatus(200, rows, res)
        }
    })
}

export const getStage=(req, res)=>{

    const sql=`SELECT st.projectID,pr.projectName, st.taskID, ts.taskName, st.userID, us.userName, us.userSurname, st.statusID, startDatePlan, endDatePlan, st.stageNumber, st.stageDescription
    FROM projectstages st, projects pr, tasks ts, users us
    WHERE pr.projectID=st.projectID AND ts.taskID=st.taskID AND us.userID=st.userID AND st.projectID=? AND st.taskID=?`

    const params = [req.params['project'],req.params['task']]
    connection.query(sql, params , (error, rows, fields) => {
        if (error) {
            responseStatus(500, error, res)
        } else {
            responseStatus(200, rows, res)
        }
    })
}

export const updateStage=(req, res)=>{

    const sql=`UPDATE projectstages SET userID=?,startDatePlan=?,endDatePlan=?,statusID=?,stageNumber=?,stageDescription=? WHERE projectID=? AND taskID=?`
    const stageKeys=['userID', 'startDatePlan', 'endDatePlan', 'statusID', 'stageNumber', 'stageDescription']

    const values=stageKeys.map(key=>{return req.body[key]})
    values.push(req.params['project'],req.params['task'])
    connection.query(sql, values, (error, results)=>{
        if(error){
            responseStatus(500, error, res)
        }
        else{
            responseStatus(200, results, res)
        }
    })
}
