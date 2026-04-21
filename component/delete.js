import db from './connectdatabase.js';

// ลบ Group ออก
export const delete_group = async (item) => {
    const { group_id } = item;
    const remove = 'delete from groups where group_id = ?';
    const [result] = await db.connectdatabase.query(remove, [group_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

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

// ลบรายชื่อ Admin Nokintranest
export const delete_admin_nokintranest = async (item) => {
    const { nokintranest_id } = item;
    const remove = 'delete from admin_nokintranests where nokintranest_id = ?';
    const [result] = await db.connectdatabase_nokintranest.query(remove, [nokintranest_id]);
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


export const delete_question_evaluation = async (item) => {
    const { part_id } = item;
    const remove = 'delete from parts where part_id = ?';
    const [result] = await db.connectdatabase_pmssystem.query(remove, [part_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}