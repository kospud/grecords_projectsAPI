import { getUserID } from "../commonModule.js"
import { responseStatus } from "../response.js"
import { connection } from "../settings/db.js"

export const getStages = (req, res) => {

    const sql = `SELECT st.projectID,pr.projectName, st.taskID, ts.taskName, st.userID, st.statusID, stat.statusName, st.startDatePlan, st.endDatePlan, st.stageNumber, st.stageDescription
    FROM projectstages st, projects pr, tasks ts, stagestatus stat
    WHERE pr.projectID=st.projectID AND ts.taskID=st.taskID AND stat.statusID=st.statusID AND st.taskID<>9`

    connection.query(sql, (error, rows, fields) => {
        if (error) {
            responseStatus(500, error, res)
        } else {
            responseStatus(200, rows, res)
        }
    })
}

export const getUsersStages = (req, res) => {

    const sql = `SELECT st.projectID,pr.projectName, st.taskID, ts.taskName, st.userID, us.userName, us.userSurname, st.statusID, startDatePlan, endDatePlan, st.stageNumber, st.stageDescription
    FROM projectstages st, projects pr, tasks ts, users us
    WHERE pr.projectID=st.projectID AND ts.taskID=st.taskID AND us.userID=st.userID AND st.userID=?`

    const userID = getUserID(req.headers['authorization'])

    if (!userID) {
        responseStatus(500, { message: "ошибка чтения токена" }, res)
    }
    connection.query(sql, userID, (error, rows, fields) => {
        if (error) {
            responseStatus(500, error, res)
        } else {
            responseStatus(200, rows, res)
        }
    })
}

export const getStage = (req, res) => {

    const sql = `SELECT st.projectID,pr.projectName, st.taskID, ts.taskName, st.userID, us.userName, us.userSurname, st.statusID, startDatePlan, endDatePlan, st.stageNumber, st.stageDescription
    FROM projectstages st, projects pr, tasks ts, users us
    WHERE pr.projectID=st.projectID AND ts.taskID=st.taskID AND us.userID=st.userID AND st.projectID=? AND st.taskID=?`

    const params = [req.params['project'], req.params['task']]
    connection.query(sql, params, (error, rows, fields) => {
        if (error) {
            responseStatus(500, error, res)
        } else {
            responseStatus(200, rows, res)
        }
    })
}

//Изменение в стадии, если надо поменять описание, даты и так далее
export const updateStage = (req, res) => {

    const sql = `UPDATE projectstages SET userID=?,startDatePlan=?,endDatePlan=?,stageNumber=?,stageDescription=? WHERE projectID=? AND taskID=?`
    const stageKeys = ['userID', 'startDatePlan', 'endDatePlan', 'stageNumber', 'stageDescription']

    const values = stageKeys.map(key => { return req.body[key] })
    values.push(req.params['project'], req.params['task'])
    connection.query(sql, values, (error, results) => {
        if (error) {
            responseStatus(500, error, res)
        }
        else {
            responseStatus(200, results, res)
        }
    })
}

export const updateStageStatus = (req, res) => {

    const newStageStatus = req.body['statusID']
    const projectID = req.params['project']
    const taskID = req.params['task']

    let sql = 'UPDATE projectStages SET statusID=? where projectID=? AND taskID=?'

    console.log(newStageStatus)
    switch (newStageStatus) {
        case 2:

            connection.beginTransaction(err => {
                if (err) {
                    responseStatus(500, { message: err.message }, res);
                }
                //Первый запрос
                connection.query(sql, [newStageStatus, projectID, taskID], (error, result) => {
                    if (error)
                        //откат при ошибке
                        return connection.rollback(() => {
                            responseStatus(500, { message: error.message }, res)
                        })
                    else {
                        sql = ''
                        connection.query()

                        //Коммит, если все ок
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

            break;

        default:
            break;
    }


}

export const getStagesReport = (req, res) => {
    const sql = `SELECT st.projectID,pr.projectName, st.taskID, ts.taskName, st.userID, st.statusID, stat.statusName, st.endDatePlan, st.endDateFact, st.stageNumber, st.stageDescription FROM projectstages st, projects pr, tasks ts, stagestatus stat WHERE pr.projectID=st.projectID AND ts.taskID=st.taskID AND stat.statusID=st.statusID AND st.taskID<>9`

    connection.query(sql, (error, rows, fileds) => {
        if (error)
            responseStatus(500, { message: error.message }, res)
        else {

            const rowsParsed = JSON.parse(JSON.stringify(rows))

            const newTasks = rowsParsed.filter(element => {
                return element.statusID === 1;
            })

            const tasksInWork = rowsParsed.filter(element => {
                return element.statusID === 2;
            })

            const successTasks = rowsParsed.filter(element => {
                const endDatePlan = new Date(element.endDatePlan)
                const endDateFact = new Date(element.endDateFact)

                return element.statusID === 3 && endDateFact <= endDatePlan
            })

            const overdueTasks = rowsParsed.filter(element => {
                const endDatePlan = new Date(element.endDatePlan)
                const endDateFact = new Date(element.endDateFact)

                return element.statusID === 3 && endDateFact > endDatePlan
            })



            responseStatus(200, { newTasks, tasksInWork, successTasks, overdueTasks }, res)
        }


    })
}

export const getProjectReport = (req, res) => {

    const sql = `SELECT st.projectID, ts.taskName, st.userID,st.statusID, stat.statusName, st.endDatePlan, st.endDateFact, st.stageNumber
    FROM projectstages st, projects pr, tasks ts, stagestatus stat WHERE pr.projectID=st.projectID AND ts.taskID=st.taskID AND stat.statusID=st.statusID AND st.taskID<>9 AND st.projectID=?
    ORDER BY stageNumber ASC;`

    connection.query(sql, req.params['id'], (error, rows, fileds) => {
        if (error) {
            responseStatus(500, { message: error.message }, res)
        } else {

            const deadlineStatuses = ['Сроки соблюдены', 'Сроки не соблюдены', 'Не установлено']
            const rowsParsed = JSON.parse(JSON.stringify(rows))

            const respData = rowsParsed.map(elem => {
                let deadlineStatus = ''

                if (elem.endDatePlan !== null) {

                    const endDatePlan = new Date(elem.endDatePlan)
                    const endDateFact = new Date(elem.endDateFact)
                    const nowDate = new Date()
                    nowDate.setHours(0, 0, 0, 0)


                    if (elem.statusID === 1 || elem.statusID === 2) {
                        if (endDatePlan <= nowDate) {
                            deadlineStatus = deadlineStatuses[0]
                        } else {
                            deadlineStatus = deadlineStatuses[1]
                        }
                    } else {
                        
                        if (endDateFact <= endDatePlan) {
                            deadlineStatus = deadlineStatuses[0]
                        } else {
                            deadlineStatus = deadlineStatuses[1]
                        }
                    }
                } else {
                    deadlineStatus = deadlineStatuses[2]
                }

                return {...elem, deadlineStatus: deadlineStatus}

            })

            responseStatus(200, respData, res)

        }
    })
}

export const getUserReport=(req,res)=>{
 
    let sql=`SELECT st.projectID,pr.projectName, st.taskID, ts.taskName, st.statusID, stat.statusName, st.endDatePlan, st.endDateFact, st.stageNumber, st.stageDescription FROM projectstages st, projects pr, tasks ts, stagestatus stat WHERE pr.projectID=st.projectID AND ts.taskID=st.taskID AND stat.statusID=st.statusID AND st.taskID<>9 AND st.userID=?`
    
    connection.query(sql,req.params['id'], (error, rows, fileds) => {
        if (error)
            responseStatus(500, { message: error.message }, res)
        else {

            const rowsParsed = JSON.parse(JSON.stringify(rows))
            const newTasks = rowsParsed.filter(element => {
                return element.statusID === 1;
            })
            const tasksInWork = rowsParsed.filter(element => {
                return element.statusID === 2;
            })
            const successTasks = rowsParsed.filter(element => {
                const endDatePlan = new Date(element.endDatePlan)
                const endDateFact = new Date(element.endDateFact)
                return element.statusID === 3 && endDateFact <= endDatePlan
            })
            const overdueTasks = rowsParsed.filter(element => {
                const endDatePlan = new Date(element.endDatePlan)
                const endDateFact = new Date(element.endDateFact)
                return element.statusID === 3 && endDateFact > endDatePlan
            })


            sql=`SELECT ts.taskName, AVG(DATEDIFF(st.endDateFact, st.startDateFact)) as timeDays 
            FROM projectstages st, tasks ts
            WHERE st.statusID=3 AND st.taskID!=9 AND ts.taskID=st.taskID AND st.userID=?
            GROUP BY taskName;`
            connection.query(sql, req.params['id'], (error, rows, fields)=>{
                if(error){
                    responseStatus(500, {message: error.message}, res)
                } else{

                    const tasksTimes=JSON.parse(JSON.stringify(rows))

                    responseStatus(200, { newTasks, tasksInWork, successTasks, overdueTasks, tasksTimes}, res)
                }
            })




            
        }


    })
}