const db = require('../config/database');

const AdminService = require('./adminService');
const NotificationService = require('./notificationService');
const EmailService = require('./emailService');

class AnnouncementService {
  static async getAnnouncements(studentId) {
    const [rows] = await db.query(`
      SELECT a.*, c.club_name 
      FROM announcements a
      JOIN clubs c ON a.club_id = c.club_id
      WHERE a.status = "PUBLISHED"
      ORDER BY a.created_at DESC
    `);
    return rows;
  }

  static async getAnnouncementDetails(announcementId) {
    const [rows] = await db.query(`
      SELECT a.*, c.club_name 
      FROM announcements a
      JOIN clubs c ON a.club_id = c.club_id
      WHERE a.announcement_id = ? AND a.status = "PUBLISHED"
    `, [announcementId]);
    if (rows.length === 0) throw new Error('Announcement not found');
    return rows[0];
  }

  static async createAnnouncement(executiveId, announcementData) {
    const [club] = await db.query(`
      SELECT c.* 
      FROM clubs c
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE ce.user_id = ?
    `, [executiveId]);
    if (club.length === 0) throw new Error('You are not assigned to any club');

    const { title, message } = announcementData;
    await db.query(
      `INSERT INTO announcements (club_id, title, message, status)
       VALUES (?, ?, ?, 'DRAFT')`,
      [club[0].club_id, title, message]
    );

    const [rows] = await db.query('SELECT * FROM announcements WHERE announcement_id = LAST_INSERT_ID()');

    await AdminService.logActivity(
      executiveId,
      'ANNOUNCEMENT_CREATED',
      { announcementId: rows[0].announcement_id, title: rows[0].title },
      'success'
    );

    return rows[0];
  }

  static async publishAnnouncement(executiveId, announcementId) {
    const [ann] = await db.query(
      `
      SELECT a.*, c.club_name
      FROM announcements a
      JOIN clubs c ON a.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE a.announcement_id = ?
        AND ce.user_id = ?
    `,
      [announcementId, executiveId],
    );

    if (ann.length === 0) {
      throw new Error("Announcement not found or unauthorized");
    }

    if (ann[0].status !== "DRAFT") {
      throw new Error("Announcement is not in draft status");
    }

    await db.query(
      `
      UPDATE announcements
      SET status = 'PUBLISHED'
      WHERE announcement_id = ?
    `,
      [announcementId],
    );

    const [rows] = await db.query(
      `
      SELECT *
      FROM announcements
      WHERE announcement_id = ?
    `,
      [announcementId],
    );

    const announcement = rows[0];

    // Find subscribed active members of this club
    const recipients =
      await NotificationService.getEligibleRecipients(
        announcement.club_id,
      );

    console.log(
      "\n========== Announcement Email Recipients ==========",
    );

    if (recipients.length === 0) {
      console.log("No subscribed students.");
    } else {
      recipients.forEach((student) => {
        console.log(
          `${student.full_name} (${student.email})`,
        );
      });
    }

    console.log(
      "===================================================\n",
    );

    // Send emails individually
    for (const student of recipients) {
      try {
        await EmailService.sendAnnouncementEmail(
          student,
          announcement,
          ann[0].club_name,
        );

        console.log(`Email sent to ${student.email}`);
      } catch (error) {
        console.error(
          `Email failed for ${student.email}:`,
          error.message,
        );
      }
    }

    await AdminService.logActivity(
      executiveId,
      "ANNOUNCEMENT_PUBLISHED",
      {
        announcementId: announcement.announcement_id,
        title: announcement.title,
        recipientCount: recipients.length,
      },
      "success",
    );

    return announcement;
  }

  static async updateAnnouncement(executiveId, announcementId, updateData) {
    const [ann] = await db.query(`
      SELECT a.* 
      FROM announcements a
      JOIN clubs c ON a.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE a.announcement_id = ? AND ce.user_id = ?
    `, [announcementId, executiveId]);
    if (ann.length === 0) throw new Error('Announcement not found or unauthorized');

    const { title, message } = updateData;
    await db.query(
      'UPDATE announcements SET title = COALESCE(?, title), message = COALESCE(?, message) WHERE announcement_id = ?',
      [title, message, announcementId]
    );
    const [rows] = await db.query('SELECT * FROM announcements WHERE announcement_id = ?', [announcementId]);

    await AdminService.logActivity(
      executiveId,
      'ANNOUNCEMENT_UPDATED',
      { announcementId: rows[0].announcement_id, title: rows[0].title },
      'success'
    );

    return rows[0];
  }

  static async getMyAnnouncements(executiveId) {
    const [rows] = await db.query(`
      SELECT a.* 
      FROM announcements a
      JOIN clubs c ON a.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE ce.user_id = ?
      ORDER BY a.created_at DESC
    `, [executiveId]);
    return rows;
  }

  static async getAllAnnouncements() {
    const [rows] = await db.query(`
      SELECT a.*, c.club_name 
      FROM announcements a
      JOIN clubs c ON a.club_id = c.club_id
      ORDER BY a.created_at DESC
    `);
    return rows;
  }

  static async removeAnnouncement(adminId, announcementId) {
    await db.query('UPDATE announcements SET status = "REMOVED" WHERE announcement_id = ?', [announcementId]);
    
    return { message: 'Announcement removed successfully' };
  }
}

module.exports = AnnouncementService;