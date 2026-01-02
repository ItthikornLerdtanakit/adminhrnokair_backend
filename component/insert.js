import db from './connectdatabase.js';
import { statusdatecalculatepms } from './functions.js';

// บันทึกกลุ่มการใช้งาน
export const save_group = async (item) => {
    const { group_name, group_employee } = item
    const placeholders = group_employee.map(() => '(?, ?)').join(', ');
    const params = [];
    const insert_group = 'insert into groups (group_name) values (?)';
    const [result_group] = await db.connectdatabase.query(insert_group, [group_name]);
    if (result_group.affectedRows > 0) {
        for (const emp of group_employee) {
            params.push(result_group.insertId, emp);
        }
        const insert_grouplist = `insert into grouplists (group_id, employee_id) values ${placeholders}`;
        const [result_grouplist] = await db.connectdatabase.query(insert_grouplist, params);
        if (result_grouplist.affectedRows > 0) {
            return 'success';
        } else {
            return 'fail';
        }
    }
}

// บันทึกแอพพลิเคชั่น
export const save_application = async (item) => {
    const { app_name, app_description, app_website, app_group, app_status } = item;
    const insert = 'insert into applications (application_name, application_description, application_website, group_id, application_status) values (?, ?, ?, ?, ?)';
    const [result_insert] = await db.connectdatabase.query(insert, [app_name, app_description, app_website, app_group, app_status]);
    if (result_insert.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// เพิ่มข้อมูลพยักงานรายคน
export const add_employee = async (item, filename) => {
    const { employee_code, employee_nameen, employee_nameth, employee_position, employee_department, employee_supervisor, employee_usertype, employee_email, employee_level, employee_status, employee_annotation, employee_startdate } = item;
    const insert = 'insert into employees (employee_code, employee_nameen, employee_nameth, employee_position, department_id, employee_supervisor, employee_usertype, employee_email, employee_level, employee_status, employee_image, employee_annotation, employee_startdate, employee_enddate) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result_insert] = await db.connectdatabase.query(insert, [employee_code, employee_nameen, employee_nameth, employee_position, employee_department, employee_supervisor, employee_usertype, employee_email, employee_level, employee_status, filename, employee_annotation, employee_startdate, '0000-00-00']);
    if (result_insert.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// อัพเดทข้อมูลพนักงานด้วยไฟล์ CSV
export const add_employee_import = async (item) => {
    const { data } = item;
    const ConvertToYYYYMMDD = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    const result = data.map(emp => ({ ...emp, employee_startdate: ConvertToYYYYMMDD(emp.employee_startdate) }));
    const columns = ['employee_code', 'employee_nameen', 'employee_nameth', 'employee_position', 'employee_supervisor', 'department_id', 'employee_usertype', 'employee_email', 'employee_level', 'employee_status', 'employee_image', 'employee_startdate', 'employee_enddate'];
    const values = result.flatMap(emp => columns.map(col => emp[col]));
    const placeholders = result.map(() => `(${columns.map(() => '?').join(',')})`).join(',');
    const insert = `insert into employees (employee_code, employee_nameen, employee_nameth, employee_position, employee_supervisor, department_id, employee_usertype, employee_email, employee_level, employee_status, employee_image, employee_startdate, employee_enddate) values ${placeholders}`;
    const [result_insert] = await db.connectdatabase.query(insert, values);
    if (result_insert.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// บันทึกแผนก
export const save_department = async (item) => {
    const { dept_code, dept_name, dept_supervisor } = item;
    const insert = 'insert into departments (department_code, department_name, department_supervisor) values (?, ?, ?)';
    const [result_insert] = await db.connectdatabase.query(insert, [dept_code, dept_name, dept_supervisor]);
    if (result_insert.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// บันทึก Email Template
export const save_emailtemplate = async (item) => {
    const { data } = item;
    const insert = 'insert into emailtemplates (emailtemplate_name, emailtemplate_subject, emailtemplate_description) values (?, ?, ?)';
    const [result_insert] = await db.connectdatabase.query(insert, [data[0].emailtemplate_name, data[0].emailtemplate_subject, data[0].emailtemplate_description]);
    if (result_insert.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// บันทึก Event ของการประเมินพนักงานภายในบริษัท
export const save_event = async (item) => {
    const { topic, description, evaluate, startdate, enddate } = item;
    const insert = 'insert into events (event_topic, event_description, event_evaluate, event_startdate, event_enddate, event_statusdate) values (?, ?, ?, ?, ?, ?)';
    const [result_insert] = await db.connectdatabase_pmssystem.query(insert, [topic, description, evaluate, startdate, enddate, statusdatecalculatepms(startdate)]);
    if (result_insert.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}