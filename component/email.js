import nodemailer from 'nodemailer';

// ------------------------------------------------------ สำหรับทดสอบ ---------------------------------------------------------
export const testconfigmail = (item) => {
    const { emailconfig_service, emailconfig_ipaddress, emailconfig_checkuser, emailconfig_user, emailconfig_apppass } = item;
    if (emailconfig_service === 'Other') {
        const address = emailconfig_ipaddress;
        const [host, port] = address.split(':');
        let transporter;
        if (emailconfig_checkuser) {
            transporter = nodemailer.createTransport({
                host: host, // ใส่ IP ของ SMTP server// ใส่ IP ของ SMTP server
                port: port, // ใส่พอร์ตของ SMTP server
                secure: false, // ไม่มีการเข้ารหัส
                tls: { rejectUnauthorized: false } // ในกรณีที่ไม่มีใบเซอร์
            });
        } else {
            transporter = nodemailer.createTransport({
                host: host, // ใส่ IP ของ SMTP server// ใส่ IP ของ SMTP server
                port: port, // ใส่พอร์ตของ SMTP server
                secure: false, // ใช้ true หากพอร์ตเป็น 465 (SSL)
                auth: {
                    user: emailconfig_user, // เปลี่ยนเป็นอีเมลของคุณ
                    pass: emailconfig_apppass,  // รหัสผ่านหรือ App Password
                },
            });
        }
        return transporter;
    } else {
        let transporter = nodemailer.createTransport({
            service: emailconfig_service, // หรือใช้ SMTP อื่น เช่น 'Yahoo', 'Outlook', หรือกำหนด host และ port เอง
            auth: {
                user: emailconfig_user, // เปลี่ยนเป็นอีเมลของคุณ
                pass: emailconfig_apppass,  // เปลี่ยนเป็นรหัสผ่านของคุณ (หรือตัว App Password หากใช้ Gmail)
            },
        });
        return transporter;
    }
};
 
export const testsendemail = (emailto, head, body, item) => {
    const { emailconfig_name, emailconfig_address } = item;
    let mailOptions = {
        from: `"${emailconfig_name}" <${emailconfig_address}>`,
        to: emailto,
        subject: head,
        html: body,
    };
     return mailOptions;
};

// ------------------------------------------------------ ใช้งานจริง ---------------------------------------------------------

export const configmail = (item) => {
   if (item[0].SettingsEmailService === 'Other') {
        const address = item[0].SettingsEmailIPAddress;
        const [host, port] = address.split(':');
        let transporter;
        if (item[0].SettingsEmailCheckUser) {
            transporter = nodemailer.createTransport({
                host: host, // ใส่ IP ของ SMTP server// ใส่ IP ของ SMTP server
                port: port, // ใส่พอร์ตของ SMTP server
                secure: false, // ไม่มีการเข้ารหัส
                tls: { rejectUnauthorized: false } // ในกรณีที่ไม่มีใบเซอร์
            });
        } else {
            transporter = nodemailer.createTransport({
                host: host, // ใส่ IP ของ SMTP server// ใส่ IP ของ SMTP server
                port: port, // ใส่พอร์ตของ SMTP server
                secure: false, // ใช้ true หากพอร์ตเป็น 465 (SSL)
                auth: {
                    user: item[0].SettingsEmailUser, // เปลี่ยนเป็นอีเมลของคุณ
                    pass: item[0].SettingsEmailApppass,  // รหัสผ่านหรือ App Password
                },
            });
        }
        return transporter;
   } else {
        let transporter = nodemailer.createTransport({
            service: item[0].SettingsEmailService, // หรือใช้ SMTP อื่น เช่น 'Yahoo', 'Outlook', หรือกำหนด host และ port เอง
            auth: {
                user: item[0].SettingsEmailUser, // เปลี่ยนเป็นอีเมลของคุณ
                pass: item[0].SettingsEmailApppass,  // เปลี่ยนเป็นรหัสผ่านของคุณ (หรือตัว App Password หากใช้ Gmail)
            },
        });
        return transporter;
   }
};

export const sendemail = (email, head, body, item) => {
    let mailOptions = {
        from: `"${item[0].SettingsEmailName}" <${item[0].SettingsEmailAddress}>`,
        to: email,
        subject: head,
        html: body,
    };
    return mailOptions;
};