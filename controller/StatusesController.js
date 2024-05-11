import { responseStatus } from "../response.js";
import { connection } from "../settings/db.js";

export const getStatuses = (req, res) => {

    const sql = 'SELECT * FROM stagestatus WHERE 1';

    connection.query(sql, (error, rows, fields) => {
        if (error) {
            responseStatus(500, { message: error.message }, res);
        } else {
            responseStatus(200, rows, res);
        }
    })

}

