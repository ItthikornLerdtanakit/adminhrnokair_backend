import db from './connectdatabase.js';
import { statusdatecalculatepms } from './functions.js';

// อัพเดทแอพพลิเคชั่นโดยเปลี่ยนกลุ่มผู้ใช้งานและสถานะได้เลยโดยไม่ต้องกดบันทึก
export const update_application_select = async (item) => {
    const { type, value, app_id } = item;
    let update;
    if (type === 'group') {
        update = 'update applications set group_id = ? where application_id = ?';
    } else if (type === 'status') {
        update = 'update applications set application_status = ? where application_id = ?';
    }
    const [result] = await db.connectdatabase.query(update, [value, app_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// อัพเดทแอพพลิเคชั่น
export const update_application = async (item) => {
    const { app_id, app_name, app_description, app_website } = item;
    const update = 'update applications set application_name = ?, application_description = ?, application_website = ? where application_id = ?';
    const [result] = await db.connectdatabase.query(update, [app_name, app_description, app_website, app_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// อัพเดทข้อมูลพนักงาน
export const update_employee = async (item, filename) => {
    const { employee_id, employee_code, employee_nameen, employee_nameth, employee_position, employee_department, employee_supervisor, employee_usertype, employee_email, employee_level, employee_status, employee_annotation, employee_startdate, employee_enddate } = item;
    let enddate = '';
    if (employee_status === 'resign') {
        enddate = employee_enddate;
    } else {
        enddate = '0000-00-00';
    }
    const update = 'update employees set employee_code = ?, employee_nameen = ?, employee_nameth = ?, employee_position = ?, department_id = ?, employee_supervisor = ?, employee_usertype = ?, employee_email = ?, employee_level = ?, employee_status = ?, employee_image = ?, employee_annotation = ?, employee_startdate = ?, employee_enddate = ? where employee_id = ?';
    const [result] = await db.connectdatabase.query(update, [employee_code, employee_nameen, employee_nameth, employee_position, employee_department, employee_supervisor, employee_usertype, employee_email, employee_level, employee_status, filename, employee_annotation, employee_startdate, enddate, employee_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// อัพเดทข้อมูลแผนก (การย้ายแผนก)
export const update_move_department = async (item) => {
    const { departmentid, departmentto } = item;
    const update = 'update departments set department_supervisor = ? where department_id = ?';
    const [result] = await db.connectdatabase.query(update, [departmentto, departmentid]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// อัพเดทข้อมูลแผนก (รายละเอียด)
export const update_department = async (item) => {
    const { departmentid, departmentcode, departmentname } = item;
    const update = 'update departments set department_code = ?, department_name = ? where department_id = ?';
    const [result] = await db.connectdatabase.query(update, [departmentcode, departmentname, departmentid]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}


// อัพเดทข้อมูลการตั้งค่า Email Config
export const update_emailconfig = async (item) => {
    const { data } = item;
    const update = 'update emailconfigs set emailconfig_service = ?, emailconfig_ipaddress = ?, emailconfig_checkuser = ?, emailconfig_user = ?, emailconfig_apppass = ?, emailconfig_address = ?, emailconfig_name = ? where emailconfig_id = ?';
    const [result] = await db.connectdatabase.query(update, [data[0].emailconfig_service, data[0].emailconfig_ipaddress, data[0].emailconfig_checkuser, data[0].emailconfig_user, data[0].emailconfig_apppass, data[0].emailconfig_address, data[0].emailconfig_name, data[0].emailconfig_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// อัพเดท Template ของ Email
export const update_emailtemplate = async (item) => {
    const { data } = item;
    const update = 'update emailtemplates set emailtemplate_name = ?, emailtemplate_subject = ?, emailtemplate_description = ? where emailtemplate_id = ?';
    const [result] = await db.connectdatabase.query(update, [data[0].emailtemplate_name, data[0].emailtemplate_subject, data[0].emailtemplate_description, data[0].emailtemplate_id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// อัพเดท Event ของการประเมินพนักงานภายในบริษัท
export const update_event = async (item) => {
    const { id, topic, description, evaluate, startdate, enddate } = item;
    const update = 'update events set event_topic = ?, event_description = ?, event_evaluate = ?, event_startdate = ?, event_enddate = ?, event_statusdate = ? where event_id = ?';
    const [result] = await db.connectdatabase_pmssystem.query(update, [topic, description, evaluate, startdate, enddate, statusdatecalculatepms(startdate), id]);
    if (result.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}