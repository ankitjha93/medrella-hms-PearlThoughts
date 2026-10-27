import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.backends.backend_pdf import PdfPages

output_pdf = r"c:\Users\ankij\OneDrive\Desktop\Hospital Management System Project\Schedula_Schedule_Module_ERD.pdf"

with PdfPages(output_pdf) as pdf:
    # ==========================================
    # PAGE 1: COMPLETE VISUAL ER DIAGRAM
    # ==========================================
    fig, ax = plt.subplots(figsize=(19, 11), dpi=300)
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#0f172a')
    ax.set_xlim(0, 190)
    ax.set_ylim(0, 110)
    ax.axis('off')

    # Title Banner
    ax.text(10, 103, "SCHEDULA &bull; HOSPITAL MANAGEMENT SYSTEM", fontsize=20, fontweight='bold', color='#38bdf8', family='sans-serif')
    ax.text(10, 99.5, "Schedule Project Module &bull; Entity-Relationship (ER) Architecture (5 Modules)", fontsize=12, color='#94a3b8', family='sans-serif')
    
    # Module Legend Pills at Top
    pills = [
        ("1. User Module", "#818cf8", 98),
        ("2. Patient Module", "#34d399", 116),
        ("3. Doctor Module", "#fbbf24", 135),
        ("4. Availability Module", "#f472b6", 153),
        ("5. Appointment Module", "#60a5fa", 173),
    ]
    for label, col, cx in pills:
        pill_box = patches.FancyBboxPatch((cx - 8, 98.5), 16, 4, boxstyle="round,pad=0.3",
                                          edgecolor=col, facecolor='#1e293b', linewidth=1.5)
        ax.add_patch(pill_box)
        ax.text(cx, 100.5, label, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#f8fafc')

    # Helper function to draw an entity table
    def draw_entity(ax, x, y, w, h, title, mod_num, header_color, fields):
        # Card shadow / border
        bg = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2",
                                    edgecolor=header_color, facecolor='#1e293b', linewidth=1.8)
        ax.add_patch(bg)
        
        # Header banner
        header_h = 3.8
        header_bg = patches.Rectangle((x, y + h - header_h), w, header_h,
                                      facecolor=header_color, edgecolor='none')
        ax.add_patch(header_bg)
        
        # Header text
        ax.text(x + 1, y + h - 2.5, f"[{mod_num}] {title}", fontsize=9, fontweight='bold', color='#0f172a' if header_color in ['#34d399', '#fbbf24'] else '#ffffff')
        
        # Draw fields
        line_y = y + h - header_h - 2.0
        for ftype, fname, ftag in fields:
            # Field tag (PK / FK)
            tag_color = '#38bdf8' if ftag == 'PK' else ('#f472b6' if ftag == 'FK' else '#64748b')
            ax.text(x + 1.2, line_y, ftag, fontsize=7, fontweight='bold', color=tag_color, family='monospace')
            ax.text(x + 4.5, line_y, fname, fontsize=7.5, color='#f8fafc', family='sans-serif', fontweight='bold' if ftag == 'PK' else 'normal')
            ax.text(x + w - 1.2, line_y, ftype, fontsize=7, color='#94a3b8', ha='right', family='monospace')
            line_y -= 2.2

    # --- ENTITIES DEFINITION ---
    # 1. User Module
    draw_entity(ax, 8, 55, 30, 36, "USERS", "M1", "#818cf8", [
        ("UUID", "id", "PK"),
        ("VARCHAR", "email (UNIQUE)", "REQ"),
        ("VARCHAR", "phone", "OPT"),
        ("VARCHAR", "password_hash", "OPT"),
        ("VARCHAR", "role [DOC|PAT|ADM]", "REQ"),
        ("VARCHAR", "auth_provider", "REQ"),
        ("BOOLEAN", "is_verified", "REQ"),
        ("TIMESTAMP", "created_at", "SYS"),
        ("TIMESTAMP", "updated_at", "SYS"),
    ])

    draw_entity(ax, 8, 18, 30, 27, "VERIFICATION_TOKENS", "M1", "#818cf8", [
        ("UUID", "id", "PK"),
        ("UUID", "user_id", "FK"),
        ("VARCHAR", "token", "REQ"),
        ("VARCHAR", "token_type", "REQ"),
        ("TIMESTAMP", "expires_at", "REQ"),
        ("BOOLEAN", "is_used", "REQ"),
        ("TIMESTAMP", "created_at", "SYS"),
    ])

    # 2. Patient Module
    draw_entity(ax, 46, 55, 30, 36, "PATIENTS", "M2", "#34d399", [
        ("UUID", "id", "PK"),
        ("UUID", "user_id (1:1)", "FK"),
        ("VARCHAR", "first_name", "REQ"),
        ("VARCHAR", "last_name", "REQ"),
        ("DATE", "date_of_birth", "REQ"),
        ("VARCHAR", "gender", "REQ"),
        ("VARCHAR", "blood_group", "OPT"),
        ("VARCHAR", "emergency_contact", "OPT"),
        ("TIMESTAMP", "created_at", "SYS"),
        ("TIMESTAMP", "updated_at", "SYS"),
    ])

    # 3. Doctor Module
    draw_entity(ax, 46, 7, 30, 39, "DOCTORS", "M3", "#fbbf24", [
        ("UUID", "id", "PK"),
        ("UUID", "user_id (1:1)", "FK"),
        ("UUID", "specialization_id", "FK"),
        ("VARCHAR", "first_name", "REQ"),
        ("VARCHAR", "last_name", "REQ"),
        ("VARCHAR", "license_number", "REQ"),
        ("INT", "experience_years", "REQ"),
        ("DECIMAL", "consultation_fee", "REQ"),
        ("DECIMAL", "rating_average", "REQ"),
        ("BOOLEAN", "is_approved", "REQ"),
        ("TIMESTAMP", "created_at", "SYS"),
    ])

    draw_entity(ax, 83, 7, 28, 17, "SPECIALIZATIONS", "M3", "#fbbf24", [
        ("UUID", "id", "PK"),
        ("VARCHAR", "name (UNIQUE)", "REQ"),
        ("TEXT", "description", "OPT"),
    ])

    # 4. Availability Module
    draw_entity(ax, 83, 62, 30, 29, "DOCTOR_AVAILABILITY", "M4", "#f472b6", [
        ("UUID", "id", "PK"),
        ("UUID", "doctor_id", "FK"),
        ("SMALLINT", "day_of_week [0-6]", "REQ"),
        ("TIME", "start_time", "REQ"),
        ("TIME", "end_time", "REQ"),
        ("INT", "slot_duration_minutes", "REQ"),
        ("BOOLEAN", "is_active", "REQ"),
    ])

    draw_entity(ax, 83, 27, 30, 32, "TIME_SLOTS", "M4", "#f472b6", [
        ("UUID", "id", "PK"),
        ("UUID", "doctor_id", "FK"),
        ("UUID", "availability_id", "FK"),
        ("DATE", "slot_date", "REQ"),
        ("TIME", "start_time", "REQ"),
        ("TIME", "end_time", "REQ"),
        ("VARCHAR", "slot_type [REG|ELAST]", "REQ"),
        ("INT", "max_capacity", "REQ"),
        ("VARCHAR", "status [AVAIL|BOOK]", "REQ"),
    ])

    # 5. Appointment Module
    draw_entity(ax, 122, 45, 33, 40, "APPOINTMENTS", "M5", "#60a5fa", [
        ("UUID", "id", "PK"),
        ("UUID", "patient_id", "FK"),
        ("UUID", "doctor_id", "FK"),
        ("UUID", "slot_id", "FK"),
        ("DATE", "appointment_date", "REQ"),
        ("TIME", "start_time", "REQ"),
        ("TIME", "end_time", "REQ"),
        ("VARCHAR", "status [SCHED|CONF|...]", "REQ"),
        ("TEXT", "reason", "OPT"),
        ("TEXT", "cancellation_reason", "OPT"),
        ("TIMESTAMP", "created_at", "SYS"),
    ])

    draw_entity(ax, 122, 11, 33, 27, "RESCHEDULE_HISTORY", "M5", "#60a5fa", [
        ("UUID", "id", "PK"),
        ("UUID", "appointment_id", "FK"),
        ("UUID", "previous_slot_id", "FK"),
        ("UUID", "new_slot_id", "FK"),
        ("VARCHAR", "rescheduled_by", "REQ"),
        ("TEXT", "reschedule_reason", "OPT"),
        ("TIMESTAMP", "rescheduled_at", "SYS"),
    ])

    # Helper function to draw relationship connector lines
    def draw_rel(ax, p1, p2, label, color='#94a3b8', rad=0.0):
        con = patches.ConnectionPatch(
            xyA=p1, coordsA=ax.transData,
            xyB=p2, coordsB=ax.transData,
            arrowstyle="->,head_width=0.3,head_length=0.4",
            connectionstyle=f"arc3,rad={rad}",
            color=color, linewidth=1.5, linestyle="--"
        )
        ax.add_patch(con)
        mx = (p1[0] + p2[0]) / 2.0
        my = (p1[1] + p2[1]) / 2.0 + (rad * 8)
        ax.text(mx, my, label, fontsize=6.8, color=color, fontweight='bold', ha='center', va='center',
                bbox=dict(boxstyle="round,pad=0.2", facecolor='#0f172a', edgecolor=color, alpha=0.9))

    # --- RELATIONSHIP ARROWS ---
    # USERS -> VERIFICATION_TOKENS (1:N)
    draw_rel(ax, (23, 55), (23, 45), "issues (1:N)", '#818cf8')
    # USERS -> PATIENTS (1:1)
    draw_rel(ax, (38, 73), (46, 73), "identifies (1:1)", '#34d399')
    # USERS -> DOCTORS (1:1)
    draw_rel(ax, (28, 55), (46, 35), "identifies (1:1)", '#fbbf24', rad=-0.2)
    # SPECIALIZATIONS -> DOCTORS (1:N)
    draw_rel(ax, (83, 15), (76, 15), "categorizes (1:N)", '#fbbf24')
    # DOCTORS -> DOCTOR_AVAILABILITY (1:N)
    draw_rel(ax, (70, 46), (83, 75), "configures (1:N)", '#f472b6', rad=0.2)
    # DOCTORS -> TIME_SLOTS (1:N)
    draw_rel(ax, (76, 35), (83, 35), "generates (1:N)", '#f472b6')
    # DOCTOR_AVAILABILITY -> TIME_SLOTS (1:N)
    draw_rel(ax, (98, 62), (98, 59), "spawns (1:N)", '#f472b6')
    # PATIENTS -> APPOINTMENTS (1:N)
    draw_rel(ax, (76, 73), (122, 73), "books (1:N)", '#34d399')
    # DOCTORS -> APPOINTMENTS (1:N)
    draw_rel(ax, (76, 25), (122, 50), "attends (1:N)", '#fbbf24', rad=-0.2)
    # TIME_SLOTS -> APPOINTMENTS (1:N)
    draw_rel(ax, (113, 45), (122, 60), "reserves (1:N)", '#f472b6', rad=0.1)
    # APPOINTMENTS -> RESCHEDULE_HISTORY (1:N)
    draw_rel(ax, (138, 45), (138, 38), "tracks (1:N)", '#60a5fa')

    # Watermark / Footer
    ax.text(10, 3, "Generated for PearlThoughts Internship &bull; Relational Schema & 3NF Architecture", fontsize=8, color='#64748b')
    ax.text(180, 3, "Page 1: Visual ERD", fontsize=8, color='#64748b', ha='right')

    plt.tight_layout()
    pdf.savefig(fig, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()

    # ==========================================
    # PAGE 2: DATA DICTIONARY & DESIGN RULES
    # ==========================================
    fig2, ax2 = plt.subplots(figsize=(19, 11), dpi=300)
    fig2.patch.set_facecolor('#ffffff')
    ax2.set_facecolor('#ffffff')
    ax2.axis('off')

    # Title
    ax2.text(0.04, 0.95, "SCHEDULA &bull; DATA DICTIONARY & ARCHITECTURAL SPECIFICATIONS", fontsize=16, fontweight='bold', color='#0f172a', transform=ax2.transAxes)
    ax2.text(0.04, 0.92, "Schedule Project Module &bull; Relational Constraints & 3NF Normalization", fontsize=10, color='#64748b', transform=ax2.transAxes)

    # Table columns
    col_labels = ["Module", "Table Name", "Key Columns", "Data Types", "Constraints & Foreign Keys", "Description"]
    table_data = [
        ["1. User", "users", "id, email, password_hash,\nrole, auth_provider", "UUID, VARCHAR(255),\nVARCHAR(20)", "PK, UNIQUE(email), NOT NULL\nrole IN ('DOCTOR','PATIENT','ADMIN')", "Central authentication authority;\ndecoupled from clinical profiles"],
        ["1. User", "verification_tokens", "id, user_id, token,\nexpires_at, is_used", "UUID, VARCHAR(255),\nTIMESTAMPTZ, BOOL", "PK, FK -> users(id)\nON DELETE CASCADE", "Secure token management for OTP,\nGoogle OAuth, and email verification"],
        ["2. Patient", "patients", "id, user_id, first_name,\nlast_name, dob, blood_group", "UUID, VARCHAR(100),\nDATE, VARCHAR(5)", "PK, FK -> users(id) UNIQUE (1:1)\nON DELETE CASCADE", "Patient demographic identity and\nbaseline medical profile attributes"],
        ["3. Doctor", "specializations", "id, name, description", "UUID, VARCHAR(100),\nTEXT", "PK, UNIQUE(name), NOT NULL", "Standardized medical specialties\n(Cardiology, Pediatrics, General)"],
        ["3. Doctor", "doctors", "id, user_id, specialization_id,\nlicense_number, fee, ratings", "UUID, VARCHAR(50),\nDECIMAL(10,2), INT", "PK, FK -> users(id) UNIQUE (1:1)\nFK -> specializations(id)", "Doctor credentials, medical license,\nconsultation charges & admin approval"],
        ["4. Availability", "doctor_availability", "id, doctor_id, day_of_week,\nstart_time, end_time, duration", "UUID, SMALLINT,\nTIME, INT", "PK, FK -> doctors(id)\nON DELETE CASCADE", "Weekly recurring schedule rules\n(e.g., Mon-Fri 09:00 - 17:00, 30m slots)"],
        ["4. Availability", "time_slots", "id, doctor_id, slot_date,\nstart_time, max_capacity, type", "UUID, DATE, TIME,\nVARCHAR(30), INT", "PK, FK -> doctors(id)\nslot_type: REGULAR | ELASTIC", "Concrete booking calendar slots;\nsupports Week 3 elastic capacity"],
        ["5. Appointment", "appointments", "id, patient_id, doctor_id,\nslot_id, status, reason", "UUID, DATE, TIME,\nVARCHAR(30), TEXT", "PK, FK -> patients, doctors, slots\nstatus: SCHED|CONF|COMPL|CANC", "Core booking transaction linking patient,\ndoctor, and reserved calendar slot"],
        ["5. Appointment", "reschedule_history", "id, appointment_id,\nprev_slot_id, new_slot_id, reason", "UUID, VARCHAR(20),\nTEXT, TIMESTAMPTZ", "PK, FK -> appointments(id)\nON DELETE CASCADE", "Full historical audit trail of\nrescheduled slots with reasons"]
    ]

    table = ax2.table(
        cellText=table_data,
        colLabels=col_labels,
        loc='center',
        cellLoc='left',
        colWidths=[0.11, 0.14, 0.22, 0.14, 0.21, 0.18]
    )

    table.auto_set_font_size(False)
    table.set_fontsize(7.5)
    table.scale(1.0, 2.2)

    # Style Header & Cells
    for (row, col), cell in table.get_celld().items():
        if row == 0:
            cell.set_facecolor('#0f172a')
            cell.set_text_props(color='#ffffff', weight='bold')
        else:
            if row % 2 == 0:
                cell.set_facecolor('#f8fafc')
            else:
                cell.set_facecolor('#ffffff')
            cell.set_text_props(color='#1e293b')
        cell.set_edgecolor('#cbd5e1')
        cell.set_linewidth(0.8)

    ax2.text(0.04, 0.04, "PearlThoughts Internship &bull; Schedule Project Module &bull; Page 2: Data Dictionary & Relational Rules", fontsize=8, color='#64748b', transform=ax2.transAxes)

    plt.tight_layout()
    pdf.savefig(fig2, facecolor=fig2.get_facecolor(), edgecolor='none')
    plt.close()

print(f"SUCCESS: PDF generated at {output_pdf}")
