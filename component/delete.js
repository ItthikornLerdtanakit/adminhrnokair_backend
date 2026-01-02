import db from './connectdatabase.js';

// ลบแอพพลิเคชั่นออก
export const delete_application = async (item) => {
    const { app_id } = item;
    const remove = 'delete from applications where application_id = ?';
    const [result] = await db.connectdatabase.query(remove, [app_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// ลบพนักงานออก
export const delete_employee = async (item) => {
    const { emp_id } = item;
    const remove = 'delete from employees where employee_id = ?';
    const [result] = db.connectdatabase.query(remove, [emp_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// ลบ Event ออก
export const delete_event = async (item) => {
    const { event_id } = item;
    const remove = 'delete from events where event_id = ?';
    const [result] = await db.connectdatabase_pmssystem.query(remove, [event_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}