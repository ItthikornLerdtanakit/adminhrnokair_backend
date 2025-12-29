import { configDotenv } from 'dotenv';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';

import db from './connectdatabase.js';

configDotenv();

export const check_permission = async (oid) => {
    const select = 'select e.employee_id, e.employee_code, e.employee_nameen, e.employee_position, e.employee_usertype, e.employee_level, d.department_id, d.department_code, d.department_name from employees e inner join departments d on e.department_id = d.department_id where employee_oid = ?';
    const [result] = await db.connectdatabase.query(select, [oid]);
    if (result.length > 0) {
        const token = jwt.sign({ result_employee: result[0] }, process.env.SECRET_KEY, { expiresIn: '1h' });
        return { status: true, token };
    } else {
        return { status: false };
    }
}

// ดึงข้อมูลแผนกทั้งหมด
export const get_department = async () => {
    const select = 'select * from departments order by department_code asc';
    const [result] = await db.connectdatabase.query(select);
    return result;
}

// ดึงข้อมูลพนักงานทั้งหมด
export const get_employee = async () => {
    const select = 'select e.employee_id, e.employee_code, e.employee_nameen, e.employee_nameth, e.employee_position, e.employee_supervisor, e.employee_usertype, e.employee_email, e.employee_level, e.employee_status, e.employee_image, e.employee_annotation, e.employee_startdate, e.employee_enddate, d.department_id, d.department_code, d.department_name from employees e inner join departments d on e.department_id = d.department_id';
    const [result] = await db.connectdatabase.query(select);
    const resultformatdate = await Promise.all(result.map(async item => {
        return {
            ...item,
            employee_startdate: moment.utc(item.employee_startdate).tz('Asia/Bangkok').format('YYYY-MM-DD'),
            employee_enddate: moment.utc(item.employee_enddate).tz('Asia/Bangkok').format('YYYY-MM-DD')
        };
    }));
    return resultformatdate;
}

// ดึงกลุ่มการใช้งาน
export const get_group = async () => {
    const select = 'select * from groups';
    const [result] = await db.connectdatabase.query(select);
    return result;
}

// ดึงแอปพลิเคชั่น
export const get_application = async () => {
    const select = 'select * from applications';
    const [result] = await db.connectdatabase.query(select);
    return result;
}

// ดึงการตั้งค่า Email Config
export const get_emailconfig = async () => {
    const select = 'select * from emailconfigs';
    const [result] = await db.connectdatabase.query(select);
    return result;
}

// ดึง Template ของ Email มาทั้งหมด
export const get_emailtemplate = async () => {
    const select = 'select * from emailtemplates';
    const [result] = await db.connectdatabase.query(select);
    return result;
}