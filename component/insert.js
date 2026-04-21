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
    const { employee_code, employee_nameen, employee_nameth, employee_nicknameen, employee_nicknameth, employee_telephone, employee_position, employee_department, employee_supervisor, employee_usertype, employee_email, employee_level, employee_status, employee_annotation, employee_startdate } = item;
    const insert = 'insert into employees (employee_code, employee_nameen, employee_nameth, employee_nicknameen, employee_nicknameth, employee_telephone, employee_position, department_id, employee_supervisor, employee_usertype, employee_email, employee_level, employee_status, employee_image, employee_annotation, employee_startdate, employee_enddate) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result_insert] = await db.connectdatabase.query(insert, [employee_code, employee_nameen, employee_nameth, employee_nicknameen, employee_nicknameth, employee_telephone, employee_position, employee_department, employee_supervisor, employee_usertype, employee_email, employee_level, employee_status, filename, employee_annotation, employee_startdate, null]);
    if (result_insert.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}

// อัพเดทข้อมูลพนักงานด้วยไฟล์ CSV
export const add_employee_import = async (data) => {
    const ConvertToYYYYMMDD = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    const result = data.map(emp => ({
        ...emp,
        department_id: emp.department_id ? Number(emp.department_id) : null,
        employee_startdate: ConvertToYYYYMMDD(emp.employee_startdate)
    }));
    // ดึง employee_code ทั้งหมดจากไฟล์
    const codes = result.map(emp => emp.employee_code);
    const [rows] = await db.connectdatabase.query(`SELECT employee_code FROM employees WHERE employee_code IN (?)`, [codes]);
    const existingCodes = new Set(rows.map(r => r.employee_code));
    // กรองออกเฉพาะที่ยังไม่มี
    const filtered = result.filter(emp => !existingCodes.has(emp.employee_code));
    if (filtered.length === 0) return { status: 'no_new_data', insert_success: 0, insert_old: result.length - filtered.length };
    const columns = [
        'employee_code', 'employee_nameen', 'employee_nameth',
        'employee_nicknameen', 'employee_nicknameth', 'employee_telephone',
        'employee_position', 'employee_supervisor', 'department_id',
        'employee_usertype', 'employee_email', 'employee_level',
        'employee_status', 'employee_image',
        'employee_startdate', 'employee_enddate'
    ];
    const values = filtered.flatMap(emp => columns.map(col => emp[col]));
    const placeholders = filtered.map(() => `(${columns.map(() => '?').join(',')})`).join(',');
    const insert = `insert into employees (${columns.join(',')}) values ${placeholders}`;
    const [result_insert] = await db.connectdatabase.query(insert, values);
    return { status: result_insert.affectedRows > 0 ? 'success' : 'fail', insert_success: result_insert.affectedRows, insert_old: result.length - filtered.length };
};



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

// บันทึกรายชื่อ Admin Nokintranest
export const save_admin_nokintranest = async (item) => {
    const { nokintranest_code, nokintranest_name, nokintranest_position, nokintranest_department } = item;
    const insert = 'insert into admin_nokintranests (nokintranest_code, nokintranest_name, nokintranest_position, nokintranest_department) values (?, ?, ?, ?)';
    const [result_insert] = await db.connectdatabase_nokintranest.query(insert, [nokintranest_code, nokintranest_name, nokintranest_position, nokintranest_department]);
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

// เพิ่มคำถามการประเมิน
export const save_question_evaluation = async (item) => {
    const { topic, weight, description, part, level } = item;
    const insert = 'insert into parts (part_topic, part_weight, part_description, parttype_id, part_level) values (?, ?, ?, ?, ?)';
    const [result_insert] = await db.connectdatabase_pmssystem.query(insert, [topic, weight, description, part, level]);
    if (result_insert.affectedRows > 0) {
        return 'success';
    } else {
        return 'fail';
    }
}