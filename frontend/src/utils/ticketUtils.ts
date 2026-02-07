import { jsPDF } from 'jspdf';

export interface TicketData {
    id: string;
    code: string;
    qrCode: string;
    status: string;
    event: {
        title: string;
        description?: string;
        location: string;
        startDate: string;
        endDate?: string;
    };
    ticketType: {
        name: string;
        price: string | number;
        currency: string;
    };
    user: {
        name: string;
        email: string;
    };
}

export const downloadQRCode = (qrCode: string, ticketCode: string) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `ticket-qr-${ticketCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const generatePDFTicket = (ticket: TicketData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Set colors
    const primaryColor = [79, 70, 229]; // Indigo
    const secondaryColor = [107, 114, 128]; // Gray

    // Header Background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('EVENT TICKET', 105, 25, { align: 'center' });

    // Event Details Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(ticket.event.title, 20, 60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    const startDate = new Date(ticket.event.startDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    doc.text(`Date: ${startDate}`, 20, 70);
    doc.text(`Location: ${ticket.event.location || 'Online'}`, 20, 78);

    // Divider
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 85, 190, 85);

    // Ticket Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Ticket Information', 20, 100);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Ticket Type: ${ticket.ticketType.name}`, 20, 110);
    doc.text(`Price: ${ticket.ticketType.price} ${ticket.ticketType.currency || 'USD'}`, 20, 118);
    doc.text(`Ticket Code: ${ticket.code}`, 20, 126);

    // Attendee Info Section
    doc.setFont('helvetica', 'bold');
    doc.text('Attendee Information', 110, 100);

    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${ticket.user.name}`, 110, 110);
    doc.text(`Email: ${ticket.user.email}`, 110, 118);

    // QR Code Section
    doc.setFillColor(249, 250, 251);
    doc.rect(55, 140, 100, 100, 'F');

    // Embed QR Code
    // qrCode is a dataURL (base64)
    doc.addImage(ticket.qrCode, 'PNG', 65, 150, 80, 80);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Please present this ticket at the entrance.', 105, 260, { align: 'center' });
    doc.text('Powered by Event Management Suite', 105, 268, { align: 'center' });

    // Border
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287);

    doc.save(`ticket-${ticket.code}.pdf`);
};
