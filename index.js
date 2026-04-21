import express from 'express';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import bodyparser from 'body-parser';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';

import { check_permission, get_department, get_employee, get_group, get_application, get_emailconfig, get_emailtemplate, get_admin_nokintranest, get_event, get_parttype_pmssystem, get_part_pmssystem } from './component/select.js';
import { save_group, save_application, add_employee, add_employee_import, save_department, save_emailtemplate, save_admin_nokintranest, save_event, save_question_evaluation } from './component/insert.js';
import { update_application_select, update_group, update_application, update_employee, update_move_department, update_department, update_emailconfig, update_emailtemplate, update_event, update_switch_evaluation, update_filename_parttype, update_question_evaluation } from './component/update.js';
import { delete_group, delete_application, delete_employee, delete_admin_nokintranest, delete_event, delete_question_evaluation } from './component/delete.js';
import { testconfigmail, testsendemail } from './component/email.js';

const now = new Date();
const pad = n => n.toString().padStart(2, '0');
const FileTime = now.getFullYear().toString() + pad(now.getMonth() + 1) + pad(now.getDate()) + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());

configDotenv();

const ipaddress = process.env.IPADDRESS;
const app = express();
const port = 5504;

app.set('trust proxy', 'loopback');

// กำหนดที่เก็บไฟล์
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

// -------------------------
//   RATE LIMIT ปลอดภัย IPv6
// -------------------------
// สร้าง Rate Limiter เพื่อลดการโจมตี DDoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100, // จำกัดที่ 100 requests ต่อ 15 นาที
    keyGenerator: (req, res) => {
        // ใช้ helper ที่ถูกต้อง (รองรับ IPv6)
        let ip = ipKeyGenerator(req);
        // ถ้ามี port เช่น 10.1.1.5:54321 → remove port
        if (typeof ip === 'string' && ip.includes(':')) {
            // IPv4 + port (มีส่วนยาว 2 ส่วน เช่น 10.1.1.5:1234)
            if (ip.split(':').length === 2 && ip.includes('.')) {
                ip = ip.split(':')[0];
            }
        }
        return ip;
    },
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// -------------------------
// CORS
// -------------------------
app.use(cors({
    origin: ipaddress,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));
app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.json({ limit: '10mb' }));

// -------------------------
// ROUTES
// -------------------------
app.post(process.env.CHECK_PERMISSION, async (req, res) => {
    try {
        const result = await check_permission(req.body.oid);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// สำหรับดึง Department ทั้งหมด
app.get(process.env.DEPARTMENT, async (_, res) => {
    try {
        const result = await get_department();
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ดึงข้อมูล Event ของการประเมินพนักงานภายในบริษัท
app.get(process.env.GET_GROUP, async (_, res) => {
    try {
        const result = await get_group();
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

app.post(process.env.SAVE_GROUP, async (req, res) => {
    try {
        const result = await save_group(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

app.put(process.env.UPDATE_GROUP, async (req, res) => {
    try {
        const result = await update_group(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ลบข้อมูล Group
app.delete(process.env.DELETE_GROUP, async (req, res) => {
    try {
        const result = await delete_group(req.query);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

app.get(process.env.GET_APPLICATION_SETTING, async (_, res) => {
    try {
        const result_group = await get_group();
        const result_application = await get_application();
        res.send({ result_group, result_application });
    } catch (error) {
        console.error(error);
    }
});

app.post(process.env.SAVE_APPLICATION, async (req, res) => {
    try {
        const result = await save_application(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

app.put(process.env.UPDATE_APPLICATION_SELECT, async (req, res) => {
    try {
        const result = await update_application_select(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

app.put(process.env.UPDATE_APPLICATION, async (req, res) => {
    try {
        const result = await update_application(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

app.delete(process.env.DELETE_APPLICATION, async (req, res) => {
    try {
        const result = await delete_application(req.query);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ดึงข้อมูลหนักงานทั้งหมดมาโชว์
app.get(process.env.EMPLOYEE, async (_, res) => {
    try {
        const result = await get_employee();
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// อัพเดทข้อมูลพนักงาน
app.put(process.env.UPDATE_EMPLOYEE, upload.single('image_update_profile'), async (req, res) => {
    try {
        if (req.body.employee_imagetype === 'newimage') {
            const file = req.file;
            const ext = path.extname(file.originalname);
            const filename = 'profile_' + req.body.employee_code + '_' + FileTime + ext;
            const result = await update_employee(req.body, filename);
            if (result === 'success') {
                const filepath = path.join(process.env.DRIVE + process.env.PATH_EMPLOYEE, filename);
                fs.writeFileSync(filepath, req.file.buffer);
                fs.rmSync(process.env.DRIVE + process.env.PATH_EMPLOYEE + req.body.employee_image);
                res.send(result);
            }
        } else {
            const result = await update_employee(req.body, req.body.employee_image);
            res.send(result);
        }
    } catch (error) {
        console.error(error);
    }
});

// เพิ่มข้อมูลพนักงานรายคน
app.post(process.env.ADD_EMPLOYEE, upload.single('image_profile'), async (req, res) => {
    try {
        const file = req.file;
        const ext = path.extname(file.originalname);
        const filename = 'profile_' + req.body.employee_code + '_' + FileTime + ext;
        const result = await add_employee(req.body, filename);
        if (result === 'success') {
            const filepath = path.join(process.env.DRIVE + process.env.PATH_EMPLOYEE, filename);
            fs.writeFileSync(filepath, req.file.buffer);
        }
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// อัพเดทข้อมูลพนักงานด้วยไฟล์ CSV
app.post(process.env.ADD_EMPLOYEE_IMPORT, upload.none(), async (req, res) => {
    try {
        const data_raw = req.body;
        const dataArray = Object.values(data_raw);
        const data = dataArray.map(emp => ({
            ...emp
        }));
        const result = await add_employee_import(data);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ลบข้อมูลพนักงาน
app.delete(process.env.DELETE_EMPLOYEE, async (req, res) => {
    try {
        const result = await delete_employee(req.query);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

app.post(process.env.SAVE_DEPARTMENT, async (req, res) => {
    try {
        const result = await save_department(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// อัพเดทข้อมูลแผนก (การย้ายแผนก)
app.put(process.env.UPDATE_MOVE_DEPARTMENT, async (req, res) => {
    try {
        const result = await update_move_department(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// อัพเดทข้อมูลแผนก (รายละเอียด)
app.put(process.env.UPDATE_DEPARTMENT, async (req, res) => {
    try {
        const result = await update_department(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ดึงการตั้งค่า Email Config
app.get(process.env.GET_EMAILCONFIG, async (_, res) => {
    try {
        const result = await get_emailconfig();
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// อัพเดทข้อมูลการตั้งค่า Email Config
app.put(process.env.UPDATE_EMAILCONFIG, async (req, res) => {
    try {
        const result = await update_emailconfig(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ทดสอบอีเมล
app.post(process.env.TEST_EMAILSERVICE, async (req, res) => {
    try {
        await testconfigmail(req.body.data[0]).sendMail(testsendemail(req.body.emailto, 'Test SMTP Email Service', req.body.description, req.body.data[0]));
        res.send('success');
    } catch (error) {
        console.error(error);
        res.send('failed');
    }
});

// ดึง Template ของ Email มาทั้งหมด
app.get(process.env.GET_EMAILTEMPLATE, async (_, res) => {
    try {
        const result = await get_emailtemplate();
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// บันทึก Email Template
app.post(process.env.SAVE_EMAILTEMPLATE, async (req, res) => {
    try {
        const result = await save_emailtemplate(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// อัพเดท Template ของ Email
app.put(process.env.UPDATE_EMAILTEMPLATE, async (req, res) => {
    try {
        const result = await update_emailtemplate(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ดึงรายชื่อ Admin Nokintranest
app.get(process.env.GET_ADMIN_NOKINTRANEST, async (_, res) => {
    try {
        const result = await get_admin_nokintranest();
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// บันทึกรายชื่อ Admin Nokintranest
app.post(process.env.SAVE_ADMIN_NOKINTRANEST, async (req, res) => {
    try {
        const result = await save_admin_nokintranest(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ลบรายชื่อ Admin Nokintranest
app.delete(process.env.DELETE_ADMIN_NOKINTRANEST, async (req, res) => {
    try {
        const result = await delete_admin_nokintranest(req.query);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ดึงข้อมูล Event ของการประเมินพนักงานภายในบริษัท
app.get(process.env.GET_EVENT, async (_, res) => {
    try {
        const result = await get_event();
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// จัดการข้อมูล Event ของการประเมินพนักงานภายในบริษัท
app.post(process.env.MANAGE_EVENT, async (req, res) => {
    try {
        if (req.body.statussave === 'insert') {
            const result = await save_event(req.body);
            res.send(result);
        } else if (req.body.statussave === 'update') {
            const result = await update_event(req.body);
            res.send(result);
        }
    } catch (error) {
        console.error(error);
    }
});

// ลบข้อมูล Event
app.delete(process.env.DELETE_EVENT, async (req, res) => {
    try {
        const result = await delete_event(req.query);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

app.get(process.env.GET_QUESTION_EVALUATION, async (_, res) => {
    try {
        const result_parttype = await get_parttype_pmssystem();
        const result_part = await get_part_pmssystem();
        res.send({ result_parttype, result_part });
    } catch (error) {
        console.error(error);
    }
});

// อัพเดทเปิด-ปิดการประเมิน
app.put(process.env.UPDATE_SWITCH_EVALUATION, async (req, res) => {
    try {
        const result = await update_switch_evaluation(req.body);
            res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// เพิ่มไฟล์ข้อกำหนดสำหรับการประเมิน
app.put(process.env.MANAGE_FILE_EVALUATION, upload.single('file_evaluation'), async (req, res) => {
    try {
        const file = req.file;
        if (file) {
            const ext = path.extname(file.originalname);
            const filename = 'evaluation_' + req.body.part + '_' + req.body.level + '_' + FileTime + ext;
            const result = await update_filename_parttype(req.body.part, req.body.level, filename);
            if (result === 'success') {
                const filepath = process.env.DRIVE + process.env.PATH_EVLUATION + filename;
                fs.writeFileSync(filepath, req.file.buffer);
            }
            res.send(result);
        } else {
            const result = await update_filename_parttype(req.body.part, req.body.level, null);
            if (result === 'success') {
                fs.rmSync(process.env.DRIVE + process.env.PATH_EVLUATION + req.body.namefile);
            }
            res.send(result);
        }
    } catch (error) {
        console.error(error);
    }
});

// เพิ่มคำถามการประเมิน
app.post(process.env.SAVE_QUESTION_EVALUATION, async (req, res) => {
    try {
        const result = await save_question_evaluation(req.body);
            res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// อัพเดทคำถามการประเมิน
app.put(process.env.UPDATE_QUESTION_EVALUATION, async (req, res) => {
    try {
        const result = await update_question_evaluation(req.body);
            res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// ลบคำถามการประเมิน
app.delete(process.env.DELETE_QUESTION_EVALUATION, async (req, res) => {
    try {
        const result = await delete_question_evaluation(req.query);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// -------------------------
// LISTEN
// -------------------------
app.listen(port, () => console.log(`Server Running On URL http://localhost:${port}`));