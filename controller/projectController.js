import { responseStatus } from "../response.js"
import { connection } from "../settings/db.js";
import { getUserID } from "../commonModule.js";

const projectKeys = [`projectName`, `userID`, `typeID`,`startDatePlan`,`endDatePlan`, `projectDescription`, `ended`]
const stageKeys = ['taskID', 'userID', 'startDatePlan', 'endDatePlan', 'statusID', 'stageNumber', 'stageDecription'];

export const getProjectsByType = (req, res) => {

    const sql = `SELECT pr.projectID, tp.typeName as type, pr.projectName, us.userName, us.userSurname, st.taskID as stageID,pr.startDatePlan as startDate, pr.endDatePlan as endDate, st.EndDatePlan as stageEndDate, ts.taskName as stageName, selectedByUser(st.projectID, ? ) as selected
    FROM projects pr, projecttypes tp, users us, projectstages st, tasks ts
    WHERE
    pr.typeID=? AND tp.typeID=pr.typeID AND us.userID=pr.userID AND st.projectID=pr.projectID AND st.statusID=2 AND ts.taskID=st.taskID AND pr.ended=0;
    `

    const token = req.headers['authorization']
    
    let userID=getUserID(token)
    
    if(!userID){
        responseStatus(500,{message: 'ошибка чтения токена пользователя'}, res)
    }
    
    const params = [userID, req.params['type']]
    connection.query(sql, params, (error, rows, fields) => {
        if (error) {
            responseStatus(500, error, res)
        } else {
            responseStatus(200, rows, res)
        }
    })

}

export const getProject = (req, res) => {

    let sql = `SELECT pr.projectID, pr.typeID, tp.typeName as type, pr.projectName, pr.userID as user, us.userName, us.userSurname, pr.projectDescription, pr.ended
    FROM projects pr, projecttypes tp, users us
    Where pr.projectID=? AND tp.typeID=pr.typeID AND us.userID=pr.userID;`

    connection.query(sql, req.params["id"], (error, rows, fields) => {
        if (error) {
            responseStatus(500, error, res)
        } else {
            if (typeof rows !== 'undefined' && rows.length > 0) {

                let rowsParsed = JSON.parse(JSON.stringify(rows))

                rowsParsed.map((row) => {

                    sql = `SELECT  st.taskID, ts.taskName, st.userID, us.userName, us.userSurname, st.startDatePlan,st.endDatePlan, st.statusID, stat.statusName, st.stageNumber, st.stageDescription
                    FROM projectstages st, tasks ts, users us, stagestatus stat
                    WHERE
                    st.projectID=? AND ts.taskID=st.taskID AND us.userID=st.userID AND stat.statusID=st.statusID
                    ORDER BY stageNumber ASC;`

                    connection.query(sql, row.projectID, (error, rows, fields) => {
                        if (error) {
                            responseStatus(500, error, res)
                        } else {

                            let stages = JSON.parse(JSON.stringify(rows))


                            responseStatus(200, { ...row, stages: stages }, res)
                        }
                    })
                })

            } else {
                responseStatus(404, { message: "Проект отсутствует" }, res)
            }
        }
    })
}


export const addProject = (req, res) => {

    let sql = "INSERT INTO `projects`(`projectName`, `userID`, `typeID`,`startDatePlan`,`endDatePlan`, `projectDescription`, `ended`) VALUES (?,?,?,?,?,?,0)"

    const insertedProjectValues = projectKeys.map(key => { return req.body[key] })

    const sendedResult = { project: {}, stages: [] };

    connection.beginTransaction(err => {
        if (err) {
            responseStatus(500, err, res);
        }
        connection.query(sql, insertedProjectValues, (error, result) => {
            if (error)
                return connection.rollback(() => {
                    responseStatus(500, error, res)
                })
            else {
                sendedResult.project = result;
                const projectID = result.insertId;

                sql = "INSERT INTO `projectstages`(`projectID`, `taskID`, `userID`, `startDatePlan`, `endDatePlan`, `statusID`, `stageNumber`, `stageDescription`) VALUES (?,?,?,?,?,?,?,?)"

                req.body.stages.forEach(element => {
                    let insertedStage = [];
                    insertedStage.push(projectID, ...stageKeys.map(key => { return element[key] }))

                    connection.query(sql, insertedStage, (error, result) => {
                        if (error) {
                            return connection.rollback(() => {
                                responseStatus(500, error, res)
                            })
                        } else {
                            sendedResult.stages.push(result)

                        }
                    })
                });

                connection.commit(error => {
                    if (error) {
                        return connection.rollback(() => {
                            responseStatus(500, error, res)
                        });
                    } else {
                        responseStatus(200, sendedResult, res);
                    }
                });

                
            }
        });
    });

}

export const updateProject = (req, res) => {

    let sql = 'SELECT projectName FROM projects WHERE projectID=?'

    connection.query(sql, req.params['id'], (error, rows, fields) => {
        if (error) {
            responseStatus(500, error, res)
        } else {
            if (typeof rows !== 'undefined' && rows.length > 0) {

                sql = "UPDATE `projects` SET `projectName`=?,`userID`=?,`typeID`=?, `projectDescription`=? WHERE projectID=?"
                const newProjectValues = projectKeys.map(key => { return req.body[key] })
                newProjectValues.push(req.params['id']);

                connection.query(sql, newProjectValues, (error, result) => {
                    if (error) {

                        responseStatus(500, error, res)

                    } else {
                        responseStatus(200, result, res)
                    }
                });

            }
            else {
                responseStatus(404, { message: `проекта с ID: ${req.params['id']} не существует` }, res)
            }
        }
    })

}

export const removeProject = (req, res) => {

    const sql = 'DELETE FROM `projects` WHERE projectID=?'

    connection.query(sql, req.params['id'], (error, result) => {
        if (error) {
            responseStatus(500, error, res)
        } else {
            responseStatus(200, result, res)
        }
    })
}

export const selectedProjects = (req, res) => {
    const sql = ``
}

export const getProjects=(req, res)=>{

    const sql='SELECT projectID, projectName FROM projects WHERE ended=0'

    connection.query(sql,(error,rows,fields)=>{
        if(error){
            responseStatus(500, {message: error.message}, res)
        } else{
            responseStatus(200, rows, res)
        }
    })
}