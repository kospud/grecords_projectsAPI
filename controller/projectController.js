import { responseStatus } from "../response.js"
import { connection } from "../settings/db.js";


export const getProjectsByType = (req, res) => {

    const sql = `SELECT pr.projectID, tp.typeName as type, pr.projectName, us.userName, us.userSurname, st.taskID as stageID, ts.taskName as stageName FROM projects pr, projecttypes tp, users us, projectstages st, tasks ts
    WHERE
    pr.typeID=? AND tp.typeID=pr.typeID AND us.userID=pr.userID AND st.projectID=pr.projectID AND st.statusID=2 AND ts.taskID=st.taskID AND pr.ended=0;
    `

    connection.query(sql, req.params['type'], (error, rows, fields) => {
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

                    sql = `SELECT st.stageID, st.taskID, ts.taskName, st.userID, us.userName, us.userSurname, st.startDatePlan,st.endDatePlan, st.statusID, stat.statusName, st.stageNumber, st.stageDescription
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

    let sql = "INSERT INTO `projects`(`projectName`, `userID`, `typeID`, `projectDescription`, `ended`) VALUES (?,?,?,?,0)"

    const projectKeys = ['projectName', 'userID', 'typeID', 'projectDescription']
    const stageKeys = ['taskID', 'userID', 'startDatePlan', 'endDatePlan', 'statusID', 'stageNumber', 'stageDecription'];
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