import { responseStatus } from "../response.js"
import { connection } from "../settings/db.js"


export const getTemplates = (req, res) => {

    const sql = 'SELECT * FROM `projecttypes`'

    connection.query(sql, (error, rows, fileds) => {
        if (error) {
            responseStatus(500, { message: error.message }, res)
        } else {
            responseStatus(200, rows, res)
        }
    })
}

export const getTemplate=(req, res)=>{
    
    const sql=`SELECT te.taskID, ta.taskName,te.defaultOrder FROM 
    templates te, tasks ta
    WHERE ta.taskID=te.taskID AND te.typeID=?
    ORDER BY defaultOrder ASC;`

    const tempalteId=req.params['id']
    connection.query(sql, tempalteId, (error, rows, fileds) => {
        if (error) {
            responseStatus(500, { message: error.message }, res)
        } else {
            responseStatus(200, rows, res)
        }
    })
}