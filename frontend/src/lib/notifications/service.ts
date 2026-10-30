import { Appointment, PaymentRecord, BillingInvoice, AppointmentReminder, NotificationItem } from '../types';

export interface NotificationResult {
  inAppId: string;
  emailSent: boolean;
  smsQueued: boolean;
}

/**
 * Multi-Channel Healthcare Communication Service
 * Handles In-App alerts, simulated email dispatch, and future SMS/WhatsApp connectors
 */
export class NotificationService {
  /**
   * Dispatches Booking & Payment Confirmation
   */
  static notifyBookingConfirmation(
    appointment: Appointment,
    payment?: PaymentRecord,
    addNotificationFn?: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => NotificationItem
  ): NotificationResult {
    const title = 'Consultation Confirmed';
    const message = `Your visit with ${appointment.doctorName} (${appointment.doctorSpecialty}) on ${appointment.date} at ${appointment.time} is confirmed. OPD Token #${appointment.tokenNumber || 1}.`;

    console.log(`[EMAIL DISPATCH] To: ${appointment.patientEmail} | Subject: Medrella HMS - Booking Confirmed (${appointment.date} ${appointment.time})`);
    if (appointment.patientPhone) {
      console.log(`[SMS CONNECTOR] To: ${appointment.patientPhone} | Msg: Medrella: Visit with ${appointment.doctorName} confirmed for ${appointment.date} ${appointment.time}. Token #${appointment.tokenNumber || 1}`);
    }

    let inAppId = `notif_${Date.now()}`;
    if (addNotificationFn) {
      const created = addNotificationFn({
        userId: appointment.patientId,
        title,
        message,
        type: 'APPOINTMENT',
        actionUrl: '/patient',
      });
      inAppId = created.id;
    }

    return { inAppId, emailSent: true, smsQueued: Boolean(appointment.patientPhone) };
  }

  /**
   * Dispatches Payment Receipt & Transaction Reference
   */
  static notifyPaymentReceipt(
    payment: PaymentRecord,
    invoice?: BillingInvoice,
    addNotificationFn?: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => NotificationItem
  ): NotificationResult {
    const title = 'Payment Receipt Issued';
    const message = `Payment of $${payment.amount.toFixed(2)} received via ${payment.provider} (${payment.paymentMethod || 'Online'}). Transaction Ref: ${payment.transactionReference || payment.id}.`;

    console.log(`[EMAIL DISPATCH] To: ${payment.patientEmail} | Subject: Medrella HMS - Payment Receipt for Invoice ${invoice?.invoiceNumber || payment.id}`);

    let inAppId = `notif_${Date.now()}`;
    if (addNotificationFn) {
      const created = addNotificationFn({
        userId: payment.patientId,
        title,
        message,
        type: 'PAYMENT',
        actionUrl: '/patient',
      });
      inAppId = created.id;
    }

    return { inAppId, emailSent: true, smsQueued: false };
  }

  /**
   * Dispatches Rescheduled Visit Alert
   */
  static notifyReschedule(
    appointment: Appointment,
    previousDate?: string,
    previousTime?: string,
    addNotificationFn?: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => NotificationItem
  ): NotificationResult {
    const title = 'Appointment Rescheduled';
    const message = `Your consultation with ${appointment.doctorName} was moved from ${previousDate || 'prior date'} to ${appointment.date} at ${appointment.time}. OPD Token #${appointment.tokenNumber || 1}.`;

    console.log(`[EMAIL DISPATCH] To: ${appointment.patientEmail} | Subject: Medrella HMS - Rescheduled Visit Notice`);

    let inAppId = `notif_${Date.now()}`;
    if (addNotificationFn) {
      const created = addNotificationFn({
        userId: appointment.patientId,
        title,
        message,
        type: 'APPOINTMENT',
        actionUrl: '/patient',
      });
      inAppId = created.id;
    }

    return { inAppId, emailSent: true, smsQueued: Boolean(appointment.patientPhone) };
  }

  /**
   * Dispatches Cancellation Notice
   */
  static notifyCancellation(
    appointment: Appointment,
    refundAmount?: number,
    addNotificationFn?: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => NotificationItem
  ): NotificationResult {
    const title = 'Consultation Cancelled';
    const refundText = refundAmount !== undefined && refundAmount > 0 
      ? ` Eligible refund: $${refundAmount.toFixed(2)}.` 
      : ' In accordance with hospital cancellation policy.';
    const message = `Your visit with ${appointment.doctorName} on ${appointment.date} at ${appointment.time} has been cancelled.${refundText}`;

    console.log(`[EMAIL DISPATCH] To: ${appointment.patientEmail} | Subject: Medrella HMS - Appointment Cancellation Notice`);

    let inAppId = `notif_${Date.now()}`;
    if (addNotificationFn) {
      const created = addNotificationFn({
        userId: appointment.patientId,
        title,
        message,
        type: 'APPOINTMENT',
        actionUrl: '/patient',
      });
      inAppId = created.id;
    }

    return { inAppId, emailSent: true, smsQueued: false };
  }

  /**
   * Dispatches Refund Processed Alert
   */
  static notifyRefund(
    payment: PaymentRecord,
    refundAmount: number,
    policyReason: string,
    addNotificationFn?: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => NotificationItem
  ): NotificationResult {
    const title = 'Refund Processed';
    const message = `Refund of $${refundAmount.toFixed(2)} initiated to your original payment method (${payment.provider}). ${policyReason}`;

    console.log(`[EMAIL DISPATCH] To: ${payment.patientEmail} | Subject: Medrella HMS - Refund Confirmation ($${refundAmount.toFixed(2)})`);

    let inAppId = `notif_${Date.now()}`;
    if (addNotificationFn) {
      const created = addNotificationFn({
        userId: payment.patientId,
        title,
        message,
        type: 'REFUND',
        actionUrl: '/patient',
      });
      inAppId = created.id;
    }

    return { inAppId, emailSent: true, smsQueued: false };
  }

  /**
   * Dispatches Automated Pre-Consultation Reminder (24h or 1h)
   */
  static notifyReminder(
    reminder: AppointmentReminder,
    addNotificationFn?: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => NotificationItem
  ): NotificationResult {
    const is1H = reminder.type === 'REMINDER_1H';
    const title = is1H ? '1-Hour Visit Reminder' : '24-Hour Visit Reminder';
    const message = is1H
      ? `Your appointment with ${reminder.doctorName} begins in 1 hour at ${reminder.time}. Please proceed to the clinic desk.`
      : `Friendly reminder: You have an appointment tomorrow at ${reminder.time} with ${reminder.doctorName}.`;

    console.log(`[REMINDER DISPATCH - ${reminder.type}] To: ${reminder.patientEmail} | Subject: Medrella HMS - Appointment Reminder`);
    if (reminder.patientPhone) {
      console.log(`[SMS REMINDER] To: ${reminder.patientPhone} | Msg: Medrella Reminder: Visit with ${reminder.doctorName} at ${reminder.time}.`);
    }

    let inAppId = `notif_${Date.now()}`;
    if (addNotificationFn) {
      const created = addNotificationFn({
        userId: reminder.patientId,
        title,
        message,
        type: 'REMINDER',
        actionUrl: '/patient',
      });
      inAppId = created.id;
    }

    return { inAppId, emailSent: true, smsQueued: Boolean(reminder.patientPhone) };
  }
}
